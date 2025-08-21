const { WebSocketServer, WebSocket } = require("ws");

const PORT = process.env.PORT || 8080;
const SERVER_ID = `server-${PORT}`;

// Connect to relayer
const relayer = new WebSocket("ws://localhost:9000");

relayer.on("open", () => {
  relayer.send(JSON.stringify({ type: "register", serverId: SERVER_ID }));
});

const wss = new WebSocketServer({ port: PORT });
const rooms = {}; // { roomName: [sockets...] }

wss.on("connection", (ws) => {
  ws.room = null;

  ws.on("message", (raw) => {
    const msg = raw.toString();

    if (msg.startsWith("join:")) {
      const room = msg.split(":")[1];
      ws.room = room;

      if (!rooms[room]) rooms[room] = [];
      rooms[room].push(ws);

      // Tell relayer this server knows this room
      relayer.send(JSON.stringify({ type: "room-join", serverId: SERVER_ID, room }));

      ws.send(`Joined room: ${room}`);
    } else if (ws.room) {
      // Forward message to relayer
      relayer.send(JSON.stringify({
        type: "message",
        serverId: SERVER_ID,
        room: ws.room,
        content: msg
      }));
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(s => s !== ws);
    }
  });
});

// Handle relayed messages
relayer.on("message", (raw) => {
  const msg = JSON.parse(raw);

  if (msg.type === "relay") {
    const { room, content } = msg;
    if (rooms[room]) {
      rooms[room].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`Room ${room}: ${content}`);
        }
      });
    }
  }
});

console.log(`WS Server ${SERVER_ID} running on ws://localhost:${PORT}`);
