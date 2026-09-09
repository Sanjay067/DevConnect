import test from "node:test";
import assert from "node:assert/strict";
import {
  extractCloudinaryPublicIdsFromText,
  extractCloudinaryPublicIdsFromPost,
} from "../src/utils/cloudinaryMarkdown.js";

test("extractCloudinaryPublicIdsFromText finds inline markdown image ids", () => {
  const markdown =
    "Hello ![img](https://res.cloudinary.com/demo/image/upload/v1/dev.connect/posts/abc123.jpg)";
  const ids = extractCloudinaryPublicIdsFromText(markdown);
  assert.deepEqual(ids, ["dev.connect/posts/abc123"]);
});

test("extractCloudinaryPublicIdsFromPost merges media array and markdown", () => {
  const post = {
    media: [{ publicId: "dev.connect/posts/carousel1" }],
    content: {
      blocks: [
        {
          data: {
            text: "![x](https://res.cloudinary.com/demo/image/upload/dev.connect/posts/inline1.png)",
          },
        },
      ],
    },
  };
  const ids = extractCloudinaryPublicIdsFromPost(post);
  assert.ok(ids.includes("dev.connect/posts/carousel1"));
  assert.ok(ids.includes("dev.connect/posts/inline1"));
});
