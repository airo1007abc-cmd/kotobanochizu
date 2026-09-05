// One-switch rollback for the catalogue-wide V2 rollout. Keep V1 implemented
// until the post-migration review is accepted.
export const USE_DIALECT_DETAIL_V2 = true;

export const dialectDetailVersion = (): "v1" | "v2" =>
  USE_DIALECT_DETAIL_V2 ? "v2" : "v1";
