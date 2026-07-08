import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dzxegwov1/image/upload/v1782120213/linkedin/avatars/d4qywptvrqbbkocidiz5.jpg",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
