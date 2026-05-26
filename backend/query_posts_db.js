import "dotenv/config";
import mongoose from "mongoose";
import Post from "./src/models/Post.js";
import User from "./src/models/User.js";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");

    const posts = await Post.find().populate("author", "name email");
    console.log("\n--- POSTS IN DATABASE ---");
    console.log("Total posts:", posts.length);
    posts.forEach((post, i) => {
      console.log(`${i + 1}. [${post.status}] "${post.title}" by ${post.author?.name || "Unknown"} (${post.author?.email || "No Email"})`);
      console.log(`   Description: ${post.description.slice(0, 80)}...`);
      console.log(`   Interested Users Count: ${post.interestedUsers?.length || 0}\n`);
    });

  } catch (err) {
    console.error("Error during query:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
