export const formatBubbleTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
