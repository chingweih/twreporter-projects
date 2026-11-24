import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Command, InvalidArgumentError } from "commander";
import { assembleOutputs } from "../taiwan/assemble.ts";
import { extractVillageLayer } from "../taiwan/extract.ts";
import { expectedSnapshotFiles } from "../taiwan/schema.ts";
import { buildTiers } from "../taiwan/tiers.ts";
import {
  publishSnapshot,
  recoverInterruptedSnapshot,
  scanDestination,
} from "./snapshot.ts";

const command = new Command("pnpm generate")
  .description(
    "Generate a Taiwan boundary snapshot from a single-layer village shapefile archive.",
  )
  .argument("<year>", "Four-digit snapshot year", (value: string) => {
    if (!/^\d{4}$/.test(value)) {
      throw new InvalidArgumentError("Expected a four-digit snapshot year.");
    }
    return value;
  })
  .parse();
const [year] = command.args;

const atlas = join(import.meta.dirname, "../..");
const geometriesRoot = join(atlas, "geometries", "taiwan");
const destination = join(geometriesRoot, year);
const backup = join(geometriesRoot, `.${year}.previous`);
const sourceArchive = join(atlas, "sources", "taiwan", year, "villages.zip");

mkdirSync(geometriesRoot, { recursive: true });
const work = mkdtempSync(join(geometriesRoot, `.generate-${year}-`));
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
  recoverInterruptedSnapshot(destination, backup, expectedSnapshotFiles);
  // Fail fast before running Mapshaper if foreign files or symlinks exist.
  void scanDestination(destination);
  const source = await extractVillageLayer(work, sourceArchive);
  const tiers = await buildTiers(work, source.path);
  const outputs = assembleOutputs(tiers, source);
  publishSnapshot({
    work,
    year,
    destination,
    backup,
    outputs,
    expectedFiles: expectedSnapshotFiles,
  });
} finally {
  process.off("SIGINT", onSigInt);
  process.off("SIGTERM", onSigTerm);
  cleanup();
}
