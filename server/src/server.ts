import express from "express";
import http from "http";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;
const messages = require("./messages.ts");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

const roomid_to_room: Map<string, Array<any>> = new Map();
const user_to_roomid = new Map();
const users: any[] = [];

app.use(cors());

io.on("connection", (socket: any) => {
  users.push(socket);
  // if there is a pair of users, match them and put them in a room
  // then ask one of them for sdp offer
  if (users.length % 2 === 0) {
    let user1 = users.pop();
    let user2 = users.pop();
    let roomid = user1.id + user2.id;
    user_to_roomid.set(user1.id, roomid);
    user_to_roomid.set(user2.id, roomid);
    roomid_to_room.set(roomid, [user1, user2]);
    user1.emit("sdp_offer");
  }
  console.log("a user has connected");
  socket.emit("message", "welcome to the server");
  socket.on("message", (message: string) => {
    console.log(message);
  });
  socket.on("sdp_offer", (offer: any) => {
    // once the offer is received from client, ask other user for answer
    let roomid = user_to_roomid.get(socket.id);
    if (roomid) {
      let other_user = roomid_to_room
        .get(roomid)
        ?.find((elem) => elem.id !== socket.id);
      if (other_user) {
        other_user.emit("sdp_offer", offer);
      } else {
        console.error("Other user not found in the room");
      }
    } else {
      console.error("Room ID not found for the user");
    }
  });
  socket.on("sdp_answer", (answer: any) => {
    let roomid = user_to_roomid.get(socket.id);
    if (roomid) {
      let other_user = roomid_to_room
        .get(roomid)
        ?.find((elem) => elem.id !== socket.id);
      if (other_user) {
        other_user.emit("sdp_answer", answer);
      } else {
        console.error("Other user not found in the room");
      }
    } else {
      console.error("Room ID not found for the user");
    }
  });

  socket.on("disconnect", () => {
    console.log("a user has disconnected");
  });
});

server.listen(port, () => {
  console.log("server");
});
