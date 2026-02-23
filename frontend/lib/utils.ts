export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTimeString(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
