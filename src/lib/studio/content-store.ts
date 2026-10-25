import type { SupabaseClient } from "@supabase/supabase-js";
import type { Section } from "./content";

/** Positions of the whole list, so a move also closes any gaps left by deletes. */
async function orderedIds(supabase: SupabaseClient, table: string) {
  const { data, error } = await supabase
    .from(table)
    .select("id,position")
    .order("position")
    .order("created_at");
  if (error) throw error;
  return data as { id: string; position: number }[];
}

export async function nextPosition(supabase: SupabaseClient, table: string) {
  const rows = await orderedIds(supabase, table);
  return (rows.at(-1)?.position ?? 0) + 1;
}

export async function moveRow(
  supabase: SupabaseClient,
  table: string,
  id: string,
  direction: "up" | "down",
) {
  const rows = await orderedIds(supabase, table);
  const from = rows.findIndex((row) => row.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= rows.length) return false;

  [rows[from], rows[to]] = [rows[to], rows[from]];
  const updates = rows
    .map((row, index) => ({ id: row.id, position: index + 1, changed: row.position !== index + 1 }))
    .filter((row) => row.changed)
    .map(({ id, position }) => supabase.from(table).update({ position }).eq("id", id));
  const results = await Promise.all(updates);
  return results.every((result) => !result.error);
}

export async function toggleRow(supabase: SupabaseClient, table: string, id: string) {
  const { data } = await supabase.from(table).select("visible").eq("id", id).maybeSingle();
  if (!data) return null;
  const visible = !data.visible;
  const { error } = await supabase.from(table).update({ visible }).eq("id", id);
  return error ? null : visible;
}

export async function deleteRow(supabase: SupabaseClient, section: Section, id: string) {
  const { error } = await supabase.from(section.table).delete().eq("id", id);
  return !error;
}
