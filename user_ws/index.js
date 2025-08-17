const  {WebSocketServer,WebSocket}  =require("ws");

const wss = new WebSocketServer({ port: 8080 });

// Room type: { sockets: WebSocket[] }
const rooms = {};

wss.on('connection',(ws)=>{
    ws.on('error',console.error);
    console.log('New client connected');
    ws.room=null;
    ws.on('message', (message) => {
        const msg=message.toString();
        console.log(`Received message: ${msg}`);
        //room join logic
        if(msg.startsWith('join:')){
            const roomName=msg.split(':')[1];
            ws.room=roomName;
            if(!rooms[roomName]){
                rooms[roomName]={sockets:[]};
            }

            rooms[roomName].sockets.push(ws);
            console.log(`Client joined room: ${roomName}`);
            ws.send(`Client joined room: ${roomName}`);
            return ;


        }

        if(ws.room && rooms[ws.room]){
            rooms[ws.room].sockets.forEach(socket=>{
                if(socket !==ws && socket.readyState===WebSocket.OPEN){
                    socket.send(`Message from ${ws.room}: ${msg}`);
                }   
            })
        }else {
      ws.send("⚠️ You must join a room first (send: join:roomName)");
    }
         
        // Echo the message back to the client
        ws.send(`Server received: ${message}`);
    });
    
    ws.on('close', () => {

        if (ws.room && rooms[ws.room]) {
    rooms[ws.room].sockets = rooms[ws.room].sockets.filter(s => s !== ws);
    if (rooms[ws.room].sockets.length === 0) {
        delete rooms[ws.room]; // remove empty room
    }
}

        console.log('Client disconnected');
    });
});


module.exports= { wss, rooms };