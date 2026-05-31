import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";

import Post from "./src/modules/post/posts.model.js";
import User from "./src/modules/user/users.model.js";
import Like from "./src/modules/like/likes.model.js";
import Comment from "./src/modules/comment/comments.model.js";

// Import your sample data
import { samplePosts } from "../sampleData.js";

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect("mongodb+srv://Sanjay:rMVYXDrBYfgrR38z@proconnectcluster1.pajjk2l.mongodb.net/?appName=proConnectCluster1");
    console.log("Connected successfully!");

    // 1. Clear existing data
    console.log("Deleting existing posts, likes, and comments...");
    await Post.deleteMany({});
    await Like.deleteMany({ targetType: "Post" });
    await Comment.deleteMany({});
    console.log("Old data cleared!");

    // 2. Find a user to act as the author
    const user = await User.findOne();
    if (!user) {
      console.error("No users found in the database! Please create an account first.");
      process.exit(1);
    }

    console.log(`Using ${user.name} as the author for these posts...`);

    // 3. Format the sample data to match the Schema exactly
    const postsToInsert = samplePosts.map((post) => ({
      ...post,
      author: user._id,
      authorName: user.name,
      authorUsername: user.username,
      authorProfilePicture: user.profilePicture,
      // Map existingMedia to media (only publicId + type, no url)
      media: post.existingMedia || [],
      isActive: true,
      likeCount: 0,
      commentCount: 0,
      score: 0,
    }));

    // 4. Insert into the database
    console.log(`Inserting ${postsToInsert.length} posts...`);
    await Post.insertMany(postsToInsert);

    console.log("All posts seeded successfully!");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
