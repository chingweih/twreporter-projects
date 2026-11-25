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
- Villages (`TaiwanVillageProperties`): `{ villageCode, name, unassigned, countyCode, districtCode, note? }`, sorted by `villageCode`. Filter on `unassigned` to exclude polygons without an assigned village. These features have a `null` name and may carry a label in `note`, such as `未編定村里` or `高雄市旗津區代管` in 2022. The village changes CSV supplies the village names for 2022 and 2026. Join on `villageCode`.

### Village changes

```ts
import villageChanges from '@lab-reporter/ddd-atlas/taiwan/village-changes'

const changes = villageChanges.find(
  ({ beforeYear, afterYear }) => beforeYear === '2022' && afterYear === '2026',
)
```

Each group contains its `id`, `beforeIds`, `afterIds`, and `extent`. IDs are strings. Use both full ID lists when comparing tallies and count each source tally once. Editors can supply an extent status, and the generator defaults to `unverified`. The 2022–2026 pair includes 三和村 (`10013280006`), which lacks a polygon in both snapshots.

Keep all year pairs in `sources/taiwan/village-changes.csv`. Each row has `before_year,after_year,comparison_unit,before_id,after_id,before_name,after_name,change_type,reason`. The year columns identify the pair, and each `comparison_unit` belongs to that pair. Keep `change_type` and `reason` in the CSV as notes about individual rows. The optional `extent_status` column accepts `equivalent`, `different`, or `unverified` and must agree within a group. The optional `missing_geometry` column accepts `before`, `after`, or `both` for entries with no assigned polygon. Keep the village IDs so the entries can still join to records such as election tallies.

The CSV display names clean up editorial brackets from the source archives, and Atlas applies its usual `臺` to `台` normalization. The spellings 濓新里 and 濓洞里 match the two codes in the March 2026 household-registration table. [Village code table](https://www.ris.gov.tw/documents/data/5/1/11503VillageUTF8.pdf)

Add rows to the same CSV for a new pair. Regenerate the affected snapshots to apply name changes, then run `pnpm generate village-changes` to validate all pairs against their snapshots and update the export.

### Map helpers

`@lab-reporter/ddd-atlas/taiwan/map` exports:

- `taiwanBounds`: `mainIsland` (excludes Pengjia, Mianhua, Dongsha, Taiping, and Diaoyutai) and `kinmen` (excludes Wuqiu).
- `keepPolygonsWithin(feature, bounds, label?)`: keeps only whole polygon parts whose exterior ring lies inside `bounds` (drops any cached `bbox`), and throws if no part remains.
- `splitTaiwanCounties(counties)`: returns `{ mainIsland, insets }` (`TaiwanCountySplit`). Applies `taiwanBounds.mainIsland` to main-island counties and `taiwanBounds.kinmen` to Kinmen (`09020`); Penghu and Lienchiang pass through untouched. Each inset has `{ countyCode, geometry }` where `geometry` is a single-feature `FeatureCollection`.

## Regenerate boundaries

From this package, run these commands with Node.js 22.18 or later. The generator reads `sources/taiwan/<year>/villages.zip` (single-layer UTF-8 shapefile) with Mapshaper, cleans topology, dissolves upward into districts and counties, normalizes `臺` to `台`, and validates administrative codes, parent-child hierarchy, WGS84 coordinate bounds, UTF-8 text, and polygon structure.

```sh
pnpm install --frozen-lockfile
pnpm generate 2022
pnpm generate 2026
pnpm generate village-changes
pnpm check-types
```

The year labels the snapshot. For another year, place the single-layer village shapefile archive at `sources/taiwan/<year>/villages.zip` and add the year's entries (plus unversioned aliases if it becomes current) to `exports` in `package.json`.

Interrupted publications recover automatically on the next run unless both `.<year>.previous` and an unexpected or incomplete `<year>/` directory exist, in which case inspect and remove the leftover backup before rerunning.
