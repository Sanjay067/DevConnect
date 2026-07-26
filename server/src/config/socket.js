import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../modules/user/users.model.js";

let io = null;
const userSockets = new Map(); // Map<userId, Set<socketId>>

const parseCookies = (cookieString = "") => {
  return cookieString.split(";").reduce((acc, curr) => {
    const [key, value] = curr.split("=");
    if (key && value) acc[key.trim()] = decodeURIComponent(value.trim());
    return acc;
  }, {});
};

export const initSocket = (server, isAllowedOrigin) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          console.warn(`[Socket.io CORS] Blocked origin: ${origin}`);
          callback(null, false);
        }
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies.accessToken;
      }

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
      const user = await User.findById(decoded.userId).select("_id name username");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("[Socket Auth Error]:", error.message);
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    console.log(`[Socket Connected] User: ${socket.user.username} (Socket: ${socket.id}). Online users: ${userSockets.size}`);

    socket.on("disconnect", () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
      console.log(`[Socket Disconnected] User: ${socket.user.username} (Socket: ${socket.id}). Online users: ${userSockets.size}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized yet!");
  }
  return io;
};

export const getUserSockets = (userId) => {
  return userSockets.get(String(userId)) || new Set();
};
