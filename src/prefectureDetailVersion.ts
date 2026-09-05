// Rollback: change this single value to "off" to restore PrefectureDetail V1 site-wide.
export const PREFECTURE_DETAIL_V2_CONFIG: { mode: "off" | "archetype" | "all" } = { mode: "all" };

const ARCHETYPE_PREFECTURE_IDS = new Set(["p2", "p17", "p22", "p35", "p41", "p46", "p47"]);

export const shouldUsePrefectureDetailV2 = (prefectureId: string) =>
  PREFECTURE_DETAIL_V2_CONFIG.mode === "all" ||
  (PREFECTURE_DETAIL_V2_CONFIG.mode === "archetype" && ARCHETYPE_PREFECTURE_IDS.has(prefectureId));
