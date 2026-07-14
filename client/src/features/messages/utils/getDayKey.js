export const getDayKey = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
