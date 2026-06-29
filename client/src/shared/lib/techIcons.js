export const getTechIconClass = (tech = "") => {
  const key = tech.trim().toLowerCase().replace(/\s+/g, "");
  switch (key) {
    case "react":
    case "reactjs":
      return "fa-brands fa-react text-blue-400";
    case "node":
    case "nodejs":
      return "fa-brands fa-node-js text-green-500";
    case "next":
    case "next.js":
    case "nextjs":
      return "fa-solid fa-n text-gray-900";
    case "js":
    case "javascript":
      return "fa-brands fa-js text-yellow-500";
    case "python":
      return "fa-brands fa-python text-blue-500";
    case "html":
    case "html5":
      return "fa-brands fa-html5 text-orange-500";
    case "css":
    case "css3":
      return "fa-brands fa-css3-alt text-blue-600";
    case "docker":
      return "fa-brands fa-docker text-blue-400";
    case "git":
    case "github":
      return "fa-brands fa-github text-gray-800";
    case "aws":
      return "fa-brands fa-aws text-orange-400";
    case "vue":
    case "vuejs":
      return "fa-brands fa-vuejs text-green-500";
    case "angular":
    case "angularjs":
      return "fa-brands fa-angular text-red-600";
    case "sass":
      return "fa-brands fa-sass text-pink-400";
    case "mongodb":
      return "fa-solid fa-database text-green-600";
    case "mysql":
      return "fa-solid fa-database text-blue-500";
    case "postgresql":
      return "fa-solid fa-database text-blue-400";
    case "express":
      return "fa-solid fa-server text-gray-500";
    case "redux":
      return "fa-solid fa-atom text-purple-500";
    case "tailwindcss":
      return "fa-solid fa-wind text-blue-400";
    case "cloudinary":
      return "fa-solid fa-cloud text-blue-500";
    case "multer":
      return "fa-solid fa-file-arrow-up text-gray-600";
    default:
      return null;
  }
};

export const TECH_SUGGESTIONS = [
  { name: "React", icon: "fa-brands fa-react text-blue-400" },
  { name: "Next.js", icon: "fa-solid fa-n text-gray-900" },
  { name: "Node.js", icon: "fa-brands fa-node-js text-green-500" },
  { name: "JavaScript", icon: "fa-brands fa-js text-yellow-500" },
  { name: "Python", icon: "fa-brands fa-python text-blue-500" },
  { name: "HTML5", icon: "fa-brands fa-html5 text-orange-500" },
  { name: "CSS3", icon: "fa-brands fa-css3-alt text-blue-600" },
  { name: "Docker", icon: "fa-brands fa-docker text-blue-400" },
  { name: "GitHub", icon: "fa-brands fa-github text-gray-800" },
  { name: "AWS", icon: "fa-brands fa-aws text-orange-400" },
  { name: "Vue.js", icon: "fa-brands fa-vuejs text-green-500" },
  { name: "Angular", icon: "fa-brands fa-angular text-red-600" },
  { name: "Sass", icon: "fa-brands fa-sass text-pink-400" },
  { name: "MongoDB", icon: "fa-solid fa-database text-green-600" },
  { name: "MySQL", icon: "fa-solid fa-database text-blue-500" },
  { name: "PostgreSQL", icon: "fa-solid fa-database text-blue-400" },
  { name: "Express", icon: "fa-solid fa-server text-gray-500" },
  { name: "Redux", icon: "fa-solid fa-atom text-purple-500" },
  { name: "TailwindCSS", icon: "fa-solid fa-wind text-blue-400" },
  { name: "Cloudinary", icon: "fa-solid fa-cloud text-blue-500" },
  { name: "Multer", icon: "fa-solid fa-file-arrow-up text-gray-600" },
];
