import mongoose from "mongoose";

const educationSchema = mongoose.Schema({
  school: {
    type: String,
    default: "",
  },
  degree: {
    type: String,
    default: "",
  },
  fieldOfStudy: {
    type: String,
    default: "",
  },
});

const workSchema = mongoose.Schema({
  company: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "",
  },
  years: {
    type: String,
    default: "",
  },
});

const profileSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bannerPicture: {
    type: String,
    default: "",
  },
  headline: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  socialLinks: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  skills: {
    type: [String],
    default: [],
  },
  currentPosition: {
    type: String,
    default: "",
  },
  pastWork: {
    type: [workSchema],
    default: [],
  },
  education: {
    type: [educationSchema],
    default: [],
  },
});

profileSchema.index({ userId: 1 }, { unique: true });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
