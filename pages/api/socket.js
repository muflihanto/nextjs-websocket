import { Server } from "Socket.IO";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      cors: {
        origin: "*",
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join-room", (room) => {
        socket.join(room);
        console.log("someone joined room " + room);
      });
      socket.on("leave-room", (room) => {
        socket.leave(room);
        console.log("someone left room " + room);
      });
      socket.on("input-change", (data) => {
        socket.broadcast.to(data.room.name).emit("update-input", data.msg);
      });
      socket.on("clipboard-change", (data) => {
        socket.broadcast.to(data.room.name).emit("update-clipboard", data.msg);
      });
    });
  }
  res.end();
};

export default SocketHandler;
