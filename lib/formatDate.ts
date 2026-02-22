import { format, isToday, isThisYear } from "date-fns";

export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, "h:mm a");
  } else if (isThisYear(date)) {
    return format(date, "MMM d, h:mm a");
  } else {
    return format(date, "MMM d, yyyy, h:mm a");
  }
}

export function formatConversationTime(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, "h:mm a");
  } else if (isThisYear(date)) {
    return format(date, "MMM d");
  } else {
    return format(date, "MM/dd/yy");
  }
}
