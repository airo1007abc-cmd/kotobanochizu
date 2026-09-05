// Rollback: change this single value to "off" to restore Region Detail V1 site-wide.
export const REGION_DETAIL_V2_CONFIG: { mode: "off" | "archetype" | "all" } = { mode: "all" };
const ARCHETYPE_REGION_IDS = new Set(["jp-22-region-中部", "jp-01-region-道央", "jp-01-region-道南", "jp-35-region-島嶼部（周防大島・平郡島など）", "jp-47-region-宮古諸島", "jp-46-region-奄美", "jp-09-region-県南", "jp-41-region-佐賀平野", "r7"]);
export const shouldUseRegionDetailV2 = (regionId: string) => REGION_DETAIL_V2_CONFIG.mode === "all" || (REGION_DETAIL_V2_CONFIG.mode === "archetype" && ARCHETYPE_REGION_IDS.has(regionId));
