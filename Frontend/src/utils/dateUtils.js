import { format } from "date-fns";

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const justNowThreshold = 60;
  if (diffInSeconds < 0) {
    const futureDiff = Math.abs(diffInSeconds);
    if (futureDiff < justNowThreshold) return "Just now";
    if (futureDiff < 60) return `in ${futureDiff} second${futureDiff !== 1 ? "s" : ""}`;
    if (futureDiff < 3600) return `in ${Math.ceil(futureDiff / 60)} minute${Math.ceil(futureDiff / 60) !== 1 ? "s" : ""}`;
    if (futureDiff < 86400) return `in ${Math.ceil(futureDiff / 3600)} hour${Math.ceil(futureDiff / 3600) !== 1 ? "s" : ""}`;
    if (futureDiff < 604800) return `in ${Math.ceil(futureDiff / 86400)} day${Math.ceil(futureDiff / 86400) !== 1 ? "s" : ""}`;
    return format(date, "MMM dd, yyyy");
  } else {
    if (diffInSeconds < justNowThreshold) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) !== 1 ? "s" : ""} ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) !== 1 ? "s" : ""} ago`;
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? "Yesterday" : `${days} days ago`;
    }
    return format(date, "MMM dd, yyyy");
  }
};

export const convertDateToWords = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleString("en-US", options);
};

export const formatDateTimeLocal = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};