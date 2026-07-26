import { cloudinary } from "../config/cloudinary.js";

export const cleanupTempAssets = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log(`[cleanup] Querying stale temporary assets created before: ${cutoff}`);

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "devConnect/temp",
      max_results: 100,
    });

    const resources = result.resources || [];
    const stale = resources.filter((r) => r.created_at < cutoff);

    if (stale.length > 0) {
      const publicIds = stale.map((r) => r.public_id);
      console.log(`[cleanup] Deleting ${publicIds.length} stale assets:`, publicIds);
      await cloudinary.api.delete_resources(publicIds);
      console.log(`[cleanup] Successfully deleted stale assets.`);
    } else {
      console.log("[cleanup] No stale assets found.");
    }
  } catch (error) {
    console.error("[cleanup] Cloudinary temp cleanup failed:", error);
  }
};
