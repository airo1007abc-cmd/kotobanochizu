export type DialectIdentityCollision = { identity: string; ids: string[] };
export function dialectIdentityKey(record: unknown): string;
export function createDialectRoutePolicy(records: readonly unknown[]): {
  identityCollisions: DialectIdentityCollision[];
  collisionIds: Set<string>;
  isRouteIndexable(record: unknown): boolean;
};
