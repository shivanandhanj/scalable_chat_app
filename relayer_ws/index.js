const {WebSocketServer,webSocket} = require("ws");

const wss = new WebSocketServer({ port: 8080 });
const servers=[];
wss.on('connection', (ws) => {

    ws.on('error', console.error);
    console.log('New client connected');
    servers.pusn(ws);
    ws.on('message', (message) => {
        const msg = message.toString();
        servers.forEach(server => {
            if (server !== ws && server.readyState === webSocket.OPEN) {
                server.send(msg);
            }
        });

    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});