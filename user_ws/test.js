const WebSocket = require("ws");
const { wss } = require("./index.js");

const SERVER_URL = "ws://127.0.0.1:8080";

afterAll(() => {
  wss.close();
});

test("Room is created when a client joins and broadcast works", (done) => {
  const client1 = new WebSocket(SERVER_URL);
  const client2 = new WebSocket(SERVER_URL);

  let closedCount = 0;
  const checkDone = () => {
    closedCount++;
    if (closedCount === 2) done();
  };

  client1.on("open", () => {
    client1.send("join:testRoom");
  });

  client2.on("open", () => {
    client2.send("join:testRoom");

    setTimeout(() => {
      client1.send("Hello testRoom!");
    }, 200);
  });

  client2.on("message", (msg) => {
    const text = msg.toString();
    if (text.includes("Hello testRoom!")) {
      expect(text).toContain("Hello testRoom!");
      client1.close();
      client2.close();
    }
  });

  client1.on("close", checkDone);
  client2.on("close", checkDone);
}, 10000);

