import {
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { Command, InvalidArgumentError } from "commander";
import { assembleOutputs } from "../taiwan/assemble.ts";
import { extractVillageLayer } from "../taiwan/extract.ts";
import { expectedSnapshotFiles } from "../taiwan/schema.ts";
import { buildTiers } from "../taiwan/tiers.ts";
import {
  buildVillageChanges,
  readVillageChanges,
  villageNamesForYear,
} from "../taiwan/village-changes.ts";
import {
  publishSnapshot,
  recoverInterruptedSnapshot,
  scanDestination,
} from "./snapshot.ts";

const command = new Command("pnpm generate")
  .description(
    "Generate a Taiwan boundary snapshot or the village changes export.",
  )
  .argument(
    "<target>",
    'Four-digit snapshot year or "village-changes"',
    (value: string) => {
      if (value !== "village-changes" && !/^\d{4}$/.test(value)) {
        throw new InvalidArgumentError(
          'Expected a four-digit snapshot year or "village-changes".',
        );
      }
      return value;
    },
  )
  .parse();
const [target] = command.args;

const atlas = join(import.meta.dirname, "../..");
const geometriesRoot = join(atlas, "geometries", "taiwan");
const sourcesRoot = join(atlas, "sources", "taiwan");

mkdirSync(geometriesRoot, { recursive: true });
const work = mkdtempSync(join(geometriesRoot, `.generate-${target}-`));
const cleanup = () => rmSync(work, { recursive: true, force: true });
const onSigInt = () => {
  cleanup();
  process.exit(130);
};
const onSigTerm = () => {
  cleanup();
  process.exit(143);
};
process.once("SIGINT", onSigInt);
process.once("SIGTERM", onSigTerm);

try {
  const file = join(sourcesRoot, "village-changes.csv");
  const pairs = readVillageChanges(file);
  if (target === "village-changes") {
    const changes = buildVillageChanges({ pairs, file, geometriesRoot });
    const staging = join(work, "village-changes.json");
    writeFileSync(staging, JSON.stringify(changes) + "\n");
    renameSync(staging, join(geometriesRoot, "village-changes.json"));
    console.log("Generated village-changes.json.");
  } else {
    const year = target;
    const destination = join(geometriesRoot, year);
    const backup = join(geometriesRoot, `.${year}.previous`);
    recoverInterruptedSnapshot(destination, backup, expectedSnapshotFiles);
    // Fail fast before running Mapshaper if foreign files or symlinks exist.
    void scanDestination(destination);
    const source = await extractVillageLayer(
      work,
      join(sourcesRoot, year, "villages.zip"),
    );
    const tiers = await buildTiers(work, source.path);
    const names = villageNamesForYear({
      pairs,
      file,
      year,
      villages: tiers.countyVillages.map(({ properties }) => properties),
    });
    for (const { properties } of tiers.countyVillages) {
      const name = names.get(properties.villageCode);
      if (!properties.unassigned && name !== undefined) properties.name = name;
    }
    publishSnapshot({
      work,
      year,
      destination,
      backup,
      outputs: assembleOutputs(tiers, source),
      expectedFiles: expectedSnapshotFiles,
    });
  }
} finally {
  process.off("SIGINT", onSigInt);
  process.off("SIGTERM", onSigTerm);
  cleanup();
}
