export const getNormalizedLinks = (links) => {
  if (!links) return [];
  if (Array.isArray(links)) return links;
  
  const arr = [];
  if (links.github) arr.push({ platform: "github", url: links.github });
  if (links.linkedin) arr.push({ platform: "linkedin", url: links.linkedin });
  if (links.portfolio) arr.push({ platform: "portfolio", url: links.portfolio });
  if (links.twitter) arr.push({ platform: "twitter", url: links.twitter });
  if (links.leetcode) arr.push({ platform: "leetcode", url: links.leetcode });
  if (links.custom) arr.push({ platform: "custom", url: links.custom });
  return arr;
};

export const getPlatformConfig = (platform) => {
  switch (platform?.toLowerCase()) {
    case "github":
      return { label: "GitHub", icon: "fa-brands fa-github" };
    case "linkedin":
      return { label: "LinkedIn", icon: "fa-brands fa-linkedin" };
    case "leetcode":
      return { label: "LeetCode", icon: "fa-solid fa-code" };
    case "twitter":
    case "x":
      return { label: "Twitter", icon: "fa-brands fa-x-twitter" };
    case "youtube":
      return { label: "YouTube", icon: "fa-brands fa-youtube" };
    case "portfolio":
      return { label: "Portfolio", icon: "fa-solid fa-link" };
    default:
      return { label: "Website", icon: "fa-solid fa-globe" };
  }
};
