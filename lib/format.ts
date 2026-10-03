export function formatEventDate(iso: string): string {
  const date = new Date(iso);
  const dayAndDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return `${dayAndDate} · ${time}`;
}