import type { Loader } from "astro/loaders";
import { buildClient } from "./build-client";

type Row = Record<string, unknown>;

/**
 * Loads one homepage content table from Supabase at build time. Row-level security
 * already hides rows the owner switched off in the Studio.
 */
export function tableLoader(
  table: string,
  columns: string,
  map: (row: Row, supabaseUrl: string) => Row = (row) => row,
): Loader {
  return {
    name: `supabase-${table}`,
    async load({ store, parseData, generateDigest, logger }) {
      const client = buildClient(logger, `the homepage (${table})`);
      store.clear();
      if (!client) return;

      const { data, error } = await client.supabase.from(table).select(columns);
      // An empty homepage section is worse than a failed deploy.
      if (error) throw new Error(`Could not load ${table} from Supabase: ${error.message}`);

      for (const row of data as unknown as Row[]) {
        const id = String(row.id);
        const mapped = map(row, client.url);
        store.set({ id, data: await parseData({ id, data: mapped }), digest: generateDigest(mapped) });
      }
    },
  };
}
