/**
 * Generates formatted IDs like F000001, C000001
 */
export function formatFarmerId(seq: number): string {
  return `F${seq.toString().padStart(6, "0")}`;
}

export function formatCultivationId(seq: number): string {
  return `C${seq.toString().padStart(6, "0")}`;
}
