// Format backend UTC → local datetime-local input
export const formatDateTimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - off);
  return local.toISOString().slice(0, 16);
};

// Deadline and metadata formatting
export const formatRelativeTime = (iso) => {
  if (!iso) return "No date";
  const then = new Date(iso);
  const now = new Date();
  const diffMs = then - now;
  const diffDays = diffMs / 86400000;

  if (diffDays > 1) return `${Math.floor(diffDays)} days left`;
  if (diffDays > 0) return "Tomorrow";
  if (diffDays > -1) return "Today";
  return `${Math.abs(Math.ceil(diffDays))} days ago`;
};

export const convertDateToWords = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
