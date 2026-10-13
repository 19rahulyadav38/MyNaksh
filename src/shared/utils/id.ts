let counter = 0;

/** Locally unique id; good enough for client-generated message ids. */
export function createId(prefix = 'local'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}
