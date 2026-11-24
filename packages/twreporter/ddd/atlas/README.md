# atlas

Geo data collection package for The Reporter graphics. We store minified GeoJSON snapshots in the repo for now and will move to npm publish later.

## Install

```bash
pnpm add --workspace @lab-reporter/ddd-atlas
```

## Taiwan

Use unversioned paths for the current snapshot (`2026`), or include the year (`2022` or `2026`) to pin a specific snapshot:

```ts
import counties from '@lab-reporter/ddd-atlas/taiwan/counties'
import taipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/63000/districts'
import taipeiVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/63000/villages'
import { splitTaiwanCounties } from '@lab-reporter/ddd-atlas/taiwan/map'
// Node ESM: add an import attribute → `with { type: 'json' }`
```

### Zoom tiers

The package ships two zoom tiers. Levels within the same tier are dissolved upward from one simplified topology so their shared borders sit flush. Do not mix tiers when overlaying borders:

- Nationwide (`200m`): `counties` and `districts`
- County (`43m`): `counties/*/districts` and `counties/*/villages`

Nationwide villages and per-district village slices are intentionally omitted for now.

### Feature properties

Public property types come from the [Zod schemas](src/taiwan/properties.ts) that validate generated outputs:

- Counties (`TaiwanCountyProperties`): `{ countyCode, name, group }` where `group` is `'北' | '中' | '南' | '東' | '離島'`. Features are ordered by editorial region group.
- Districts (`TaiwanDistrictProperties`): `{ districtCode, name, countyCode }`, sorted by `districtCode`.
- Villages (`TaiwanVillageProperties`): `{ villageCode, name, unassigned, countyCode, districtCode, note? }`, sorted by `villageCode`. Filter on `unassigned` to exclude polygons without an assigned village. These features have a `null` name and may carry a label in `note`, such as `未編定村里` or `高雄市旗津區代管` in 2022. Some source village names contain editorial brackets (such as `[那]拔里`), so join on `villageCode`.

### Map helpers

`@lab-reporter/ddd-atlas/taiwan/map` exports:

- `taiwanBounds`: `mainIsland` (excludes Pengjia, Mianhua, Dongsha, Taiping, and Diaoyutai) and `kinmen` (excludes Wuqiu).
- `keepPolygonsWithin(feature, bounds, label?)`: keeps only whole polygon parts whose exterior ring lies inside `bounds` (drops any cached `bbox`), and throws if no part remains.
- `splitTaiwanCounties(counties)`: returns `{ mainIsland, insets }` (`TaiwanCountySplit`). Applies `taiwanBounds.mainIsland` to main-island counties and `taiwanBounds.kinmen` to Kinmen (`09020`); Penghu and Lienchiang pass through untouched. Each inset has `{ countyCode, geometry }` where `geometry` is a single-feature `FeatureCollection`.

## Regenerate boundaries

From this package, run these commands with Node.js 22.18 or later. The generator reads `sources/taiwan/<year>/villages.zip` (single-layer UTF-8 shapefile) with Mapshaper, cleans topology, dissolves upward into districts and counties, normalizes `臺` to `台`, and validates administrative codes, parent-child hierarchy, WGS84 coordinate bounds, UTF-8 text, and polygon structure.

```sh
pnpm install --frozen-lockfile
pnpm generate 2026
pnpm generate 2022
pnpm check-types
```

The year labels the snapshot. For another year, place the single-layer village shapefile archive at `sources/taiwan/<year>/villages.zip` and add the year's entries (plus unversioned aliases if it becomes current) to `exports` in `package.json`.

Interrupted publications recover automatically on the next run unless both `.<year>.previous` and an unexpected or incomplete `<year>/` directory exist, in which case inspect and remove the leftover backup before rerunning.
