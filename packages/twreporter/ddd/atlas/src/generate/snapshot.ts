import assert from "node:assert/strict";
import * as fs from "node:fs";
import { dirname, join, relative } from "node:path";
import { collection, type Boundary } from "./geojson.ts";

const toPosix = (p: string) => p.replaceAll("\\", "/");

function assertRealDirectory(path: string) {
  if (!fs.lstatSync(path).isDirectory()) {
    throw new Error(`Expected ${path} to be a regular directory`);
  }
}

export function scanDestination(destination: string): {
  files: string[];
  dirs: string[];
} {
  if (!fs.existsSync(destination)) return { files: [], dirs: [] };
  assertRealDirectory(destination);
  const unexpected: string[] = [];
  const files: string[] = [];
  const dirs: string[] = [];
  for (const entry of fs.readdirSync(destination, {
    recursive: true,
    withFileTypes: true,
  })) {
    const rel = toPosix(
      relative(destination, join(entry.parentPath, entry.name)),
    );
    if (entry.isDirectory()) dirs.push(rel);
    else if (entry.isFile() && entry.name === ".DS_Store") continue;
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(rel);
    else unexpected.push(rel);
  }
  if (unexpected.length) {
    throw new Error(
      `Unexpected entries in ${destination}: ${unexpected.join(", ")}`,
    );
  }
  return { files, dirs };
}

function parentDirsOf(files: readonly string[]) {
  const dirs = new Set<string>();
  for (const file of files) {
    for (
      let dir = toPosix(dirname(file));
      dir !== "." && dir !== "";
      dir = toPosix(dirname(dir))
    ) {
      dirs.add(dir);
    }
  }
  return dirs;
}

export function recoverInterruptedSnapshot(
  destination: string,
  backup: string,
  expectedFiles: readonly string[],
) {
  if (!fs.existsSync(backup)) return;
  assertRealDirectory(backup);
  if (!fs.existsSync(destination)) {
    fs.renameSync(backup, destination);
    return;
  }
  // A crash between renameSync(staging, destination) and rmSync(backup) leaves
  // both directories. Drop backup only if destination matches expected paths exactly.
  const { files, dirs } = scanDestination(destination);
  const existingFiles = new Set(files);
  const expectedDirs = parentDirsOf(expectedFiles);
  const exactMatch =
    files.length === expectedFiles.length &&
    expectedFiles.every((file) => existingFiles.has(file)) &&
    dirs.every((dir) => expectedDirs.has(dir));
  if (exactMatch) {
    fs.rmSync(backup, { recursive: true, force: true });
    return;
  }
  throw new Error(
    `Found leftover backup at ${backup} alongside unexpected or incomplete ${destination}; inspect and resolve before regenerating.`,
  );
}

export function publishSnapshot({
  work,
  year,
  destination,
  backup,
  outputs,
  expectedFiles,
}: {
  work: string;
  year: string;
  destination: string;
  backup: string;
  outputs: ReadonlyMap<string, Boundary[]>;
  expectedFiles: readonly string[];
}) {
  assert.deepEqual(
    Array.from(outputs.keys()).sort(),
    Array.from(expectedFiles).sort(),
    "Generated output keys do not match expectedSnapshotFiles",
  );
  const staging = join(work, "snapshot");
  const changed: string[] = [];
  for (const [file, features] of outputs) {
    const path = join(staging, file);
    const content = JSON.stringify(collection(features)) + "\n";
    fs.mkdirSync(dirname(path), { recursive: true });
    fs.writeFileSync(path, content);
    const existing = join(destination, file);
    if (
      !fs.existsSync(existing) ||
      fs.readFileSync(existing, "utf8") !== content
    ) {
      changed.push(file);
    }
  }
  const hasSnapshot = fs.existsSync(destination);
  const { files: existingFiles, dirs: existingDirs } =
    scanDestination(destination);
  const expectedDirs = parentDirsOf(expectedFiles);
  const stale = [
    ...existingFiles.filter((file) => !outputs.has(file)),
    ...existingDirs.filter((dir) => !expectedDirs.has(dir)),
  ];
  if (changed.length || stale.length) {
    if (hasSnapshot) fs.renameSync(destination, backup);
    try {
      fs.renameSync(staging, destination);
    } catch (cause) {
      if (hasSnapshot && fs.existsSync(backup) && !fs.existsSync(destination)) {
        try {
          fs.renameSync(backup, destination);
        } catch {
          // Keep the original publication error visible.
        }
      }
      throw cause;
    }
    if (hasSnapshot) fs.rmSync(backup, { recursive: true });
  }
  console.log(
    `${year}: generated ${outputs.size} GeoJSON files (${changed.length} changed, ${stale.length} stale).`,
  );
}
