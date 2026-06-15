import { format, parseISO } from "date-fns";

export function formatMatchTime(dateString: string) {
  try {
    return format(parseISO(dateString), "MMM d, HH:mm");
  } catch (e) {
    return dateString;
  }
}

export function formatMinute(minute: number | null | undefined) {
  if (minute === null || minute === undefined) return "";
  return `${minute}'`;
}
