import { format } from "date-fns";

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const justNowThreshold = 60;

  if (diffInSeconds < 0) {
    const futureDiff = Math.abs(diffInSeconds);
    if (futureDiff < justNowThreshold) {
      return "Just now";
    } else if (futureDiff < 60) {
      return `in ${futureDiff} second${futureDiff !== 1 ? "s" : ""}`;
    } else if (futureDiff < 3600) {
      const minutes = Math.ceil(futureDiff / 60);
      return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else if (futureDiff < 86400) {
      const hours = Math.ceil(futureDiff / 3600);
      return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else if (futureDiff < 604800) {
      const days = Math.ceil(futureDiff / 86400);
      return `in ${days} day${days !== 1 ? "s" : ""}`;
    } else {
      return format(date, "MMM dd, yyyy");
    }
  } else {
    if (diffInSeconds < justNowThreshold) {
      return "Just now";
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? "Yesterday" : `${days} days ago`;
    } else {
      return format(date, "MMM dd, yyyy");
    }
  }
};

export const convertDateToWords = (dateString) => {
  const date = new Date(dateString);

  if (isNaN(date)) {
    return "Invalid Date";
  }

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

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
