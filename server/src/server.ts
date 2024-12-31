import express from "express";
import http from "http";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;
const messages = require("./messages.ts");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

const roomid_to_room: Map<string, Array<any>> = new Map();
const user_to_roomid = new Map();
const users: any[] = [];

/**
 * Print the socket ids for each socket in each room
 */
function printRoomSocketIds() {
  roomid_to_room.forEach((users, roomid) => {
    const socketIds = users.map((user) => user.id);
    console.log(`Room ID: ${roomid}, Socket IDs: ${socketIds.join(", ")}`);
  });
}

/**
 * Return the other person in the room give a user's opened socket
 * @param socket the user's opened socket with the srever
 * @throws Error if 'socket' is not in a room.
 */
function otherPerson(socket: any) {
  let roomid = user_to_roomid.get(socket.id);
  if (roomid === undefined) {
    throw new Error("Room Error");
  }
  if (roomid) {
    let other_user = roomid_to_room
      .get(roomid)
      ?.find((elem) => elem.id !== socket.id);
    if (other_user === undefined) {
      throw new Error("Other User Error");
    }
    return other_user;
  } else {
    console.error("Room ID not found for the user");
  }
}

app.use(cors());

io.on("connection", (socket: any) => {
  console.log("a user has connected");
  socket.on("sdp_start", () => {
    console.log("a user has requested sdp start");
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
      console.log(`a room was created with ${user1.id} ${user2.id}`);
      printRoomSocketIds();
      // request the first offer from the user A
      user1.emit("sdp_offer_client");
      console.log(`${user1.id} : sdp offer was requested (server)`);
    }
  });
  // take the first offer from user A and send it to user B
  socket.on("sdp_offer_server", (offer: any) => {
    console.log(`sdp offer was received from client`);
    // once the offer is received from client, ask other user for answer
    let roomid = user_to_roomid.get(socket.id);
    let other_user = otherPerson(socket);
    console.log(other_user.id, socket.id);
    other_user.emit("sdp_answer_client", offer);
  });
  // take the answer from user B and send it to user A
  socket.on("sdp_answer_server", (answer: any) => {
    console.log("sdp answer was received");
    let other_user = otherPerson(socket);
    other_user.emit("sdp_finish_client", answer);
  });

  socket.on("new_ice_candidate", (candidate: any) => {
    otherPerson(socket).emit("ice_candidate_client", candidate);
  });
  socket.on("request_new_peer", () => {
    if (users.includes(socket)) {
      // Do nothing if the user is already in the queue waiting for a peer
    } else {
      let roomid = user_to_roomid.get(socket.id);
      let other_user = otherPerson(socket);
      roomid_to_room.delete(roomid);
      // delete the mapping from the users to the room
      user_to_roomid.delete(socket.id);
      user_to_roomid.delete(other_user.id);
      // ask the users to reset their connection (fixes things like resetting peer connection)
      other_user.emit("reset_connection");
      socket.emit("reset_connection");
      console.log("a user has requested a new peer");
    }
  });
  socket.on("disconnect", () => {
    // user was in queue matching
    if (users.includes(socket)) {
      users.splice(users.indexOf(socket), 1);
      console.log("a user has disconnected");
    }
    // user was in a room
    else {
      let roomid = user_to_roomid.get(socket.id);
      let other_user = otherPerson(socket);
      roomid_to_room.delete(roomid);
      user_to_roomid.delete(socket.id);
      user_to_roomid.delete(other_user.id);
      other_user.emit("reset_connection");
      console.log("a user has disconnected");
    }
  });
  return () => {
    socket.off("sdp_offer_server");
    socket.off("sdp_answer_server");
    socket.off("disconnect");
  };
});

server.listen(port, () => {
  console.log("server");
});
