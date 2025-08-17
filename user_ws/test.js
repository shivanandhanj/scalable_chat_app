const WebSocket = require("ws");
const { wss, rooms } = require("./index.js");

const SERVER_URL = "ws://127.0.0.1:8080";

beforeAll((done) => {
  wss.on("listening", () => done());
});

afterAll(() => {
  wss.close();
});

test("Room is created when a client joins and broadcast works", (done) => {
  const client1 = new WebSocket(SERVER_URL);
  const client2 = new WebSocket(SERVER_URL);

  let joinAck1 = false;
  let joinAck2 = false;
  let broadcastReceived = false;

  client1.on("open", () => {
    client1.send("join:testRoom");
  });

  client2.on("open", () => {
    client2.send("join:testRoom");
    setTimeout(() => {
      client1.send("Hello testRoom!");
    }, 100);
  });

  client1.on("message", (msg) => {
    const text = msg.toString();
    if (text.includes("Joined room: testRoom")) joinAck1 = true;
  });

  client2.on("message", (msg) => {
    const text = msg.toString();
    if (text.includes("Joined room: testRoom")) joinAck2 = true;
    if (text.includes("Hello testRoom!")) broadcastReceived = true;

    if (joinAck1 && joinAck2 && broadcastReceived) {
      expect(rooms["testRoom"]).toBeDefined();
      expect(text).toContain("Hello testRoom!");
      done();
    }
  });
});