/**
 * Format date to DD/MM/YYYY
 */
export function formatDDMMYYYY(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format amount to GBP currency
 */
export function formatGBP(amount: number | string | undefined): string {
  const numberAmount = Number(amount);
  if (!Number.isFinite(numberAmount)) return '£0.00';
  return `£${numberAmount.toFixed(2)}`;
}
