export const formatDateSeparator = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startDate = new Date(d);
  startDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((startToday - startDate) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};
