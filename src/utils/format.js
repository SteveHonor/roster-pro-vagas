const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const BRL_CENTS = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
const NUM = new Intl.NumberFormat('pt-BR');

/** R$ 8.000 (sem centavos) */
export function formatCurrency(value) {
  const n = value != null && value !== '' ? Number(value) : null;
  if (n == null || isNaN(n)) return '—';
  return BRL.format(n);
}

/** R$ 8.000,00 — para valores em centavos (ex: 800000 → R$ 8.000,00) */
export function formatCurrencyCents(cents) {
  if (cents == null) return '—';
  return BRL_CENTS.format(Number(cents) / 100);
}

/** R$ 8.000,00 (com centavos) */
export function formatCurrencyFull(value) {
  const n = value != null && value !== '' ? Number(value) : null;
  if (n == null || isNaN(n)) return '—';
  return BRL_CENTS.format(n);
}

/** R$ 8.000 – R$ 12.000 */
export function formatSalaryRange(min, max) {
  const a = min != null && min !== '' ? Number(min) : null;
  const b = max != null && max !== '' ? Number(max) : null;
  if (!a && !b) return null;
  if (a && b) return `${BRL.format(a)} – ${BRL.format(b)}`;
  if (a) return `a partir de ${BRL.format(a)}`;
  return `até ${BRL.format(b)}`;
}

/** 10/06/2026 */
export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** 10/06/2026 14:30 */
export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** 10/06 */
export function formatDateShort(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** 1.234 */
export function formatNumber(value) {
  const n = value != null ? Number(value) : null;
  if (n == null || isNaN(n)) return '—';
  return NUM.format(n);
}

/** "há 2 dias" / "hoje" */
export function timeAgo(value) {
  if (!value) return '';
  const diff = Math.floor((Date.now() - new Date(value)) / 86400000);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'há 1 dia';
  if (diff < 30) return `há ${diff} dias`;
  if (diff < 60) return 'há 1 mês';
  return `há ${Math.floor(diff / 30)} meses`;
}
