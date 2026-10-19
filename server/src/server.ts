
import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";

import app from "./app.js";
import { sequelize } from "./config/database.js";
import { setupSocket } from "./sockets/index.js";

const PORT = Number(process.env.PORT) || 5000;

// Create an HTTP server using the existing Express app.
const httpServer = createServer(app);

// Attach Socket.IO to the same HTTP server.
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
app.set("io", io);

setupSocket(io);


const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("PostgreSQL connected successfully");

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("Socket.IO server initialized");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
