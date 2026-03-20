import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type Snapshot = Array<{ key: QueryKey; value: unknown }>;

export async function snapshotQueries(
  queryClient: QueryClient,
  keys: QueryKey[]
): Promise<Snapshot> {
  await Promise.all(
    keys.map((key) => queryClient.cancelQueries({ queryKey: key }))
  );

  return keys.map((key) => ({
    key,
    value: queryClient.getQueryData(key),
  }));
}

export function rollbackSnapshot(
  queryClient: QueryClient,
  snapshot: Snapshot | undefined
): void {
  if (!snapshot) return;
  snapshot.forEach(({ key, value }) => {
    queryClient.setQueryData(key, value);
  });
}

export function replaceById<T extends { id: string }>(
  list: T[] | undefined,
  id: string,
  updater: (item: T) => T
): T[] | undefined {
  if (!list) return list;
  return list.map((item) => (item.id === id ? updater(item) : item));
}

export function removeById<T extends { id: string }>(
  list: T[] | undefined,
  id: string
): T[] | undefined {
  if (!list) return list;
  return list.filter((item) => item.id !== id);
}

export function prependItem<T>(list: T[] | undefined, item: T): T[] {
  return [item, ...(list ?? [])];
}

