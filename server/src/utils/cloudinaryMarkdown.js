// NOTE: This regex must be created inside the function (not at module level)
// because the `g` flag makes it stateful — it retains `lastIndex` between
// calls, causing alternating calls to skip all matches.
const CLOUDINARY_PUBLIC_ID_PATTERN =
  /res\.cloudinary\.com\/[^/]+\/(?:image|video|raw)\/upload(?:\/[^/]+)*\/(devConnect\/posts\/[^)\s"'<>]+)/gi;

export function extractCloudinaryPublicIdsFromText(text = "") {
  if (!text) return [];

  // Create a new RegExp instance each call to reset lastIndex
  const regex = new RegExp(CLOUDINARY_PUBLIC_ID_PATTERN.source, CLOUDINARY_PUBLIC_ID_PATTERN.flags);
  const ids = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const publicId = match[1].replace(/\.[a-zA-Z0-9]+$/, "");
    ids.add(publicId);
  }
  return [...ids];
}

export function extractCloudinaryPublicIdsFromPost(post) {
  const ids = new Set();

  for (const file of post?.media || []) {
    if (file?.publicId) ids.add(file.publicId);
  }

  const markdown = post?.content?.blocks?.[0]?.data?.text || "";
  for (const id of extractCloudinaryPublicIdsFromText(markdown)) {
    ids.add(id);
  }

  return [...ids];
}

export async function destroyCloudinaryAssets(cloudinary, publicIds = []) {
  for (const publicId of publicIds) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (_) {
      /* ignore missing assets */
    }
  }
}
