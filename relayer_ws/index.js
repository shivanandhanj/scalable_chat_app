const {WebSocketServer} = require('ws');

const wss = new WebSocketServer({ port: 9000 });
const servers=new Map();


const serverRooms={};

wss.on('connection',(ws)=>{


    let serverId=null;

    ws.on("message",(raw)=>{
        const data = JSON.parse(raw);

        if(data.type==='register'){
            serverId=data.serverId;
            servers.set(serverId,ws);

            serverRooms[serverId]=new Set();
            console.log(`Server ${serverId} registered`);
        }

        if(data.type==='room-join'){
            serverRooms[serverId].add(data.room);
            console.log(`Server ${serverId} joined room ${data.room}`);
        }
        if(data.type==='message'){
            const {room,content}=data;
            console.log(`Relayer got msg ${content}`);


            for(const [id,server] of servers.entries()){
                if(serverRooms[id].has(room)){
                    server.send(JSON.stringify({
                        type:'message',
                        room,
                        content
                    }));
                }
            }
            console.log(`Relayer sent msg ${content} to room ${room}`);
        }

    });
    ws.on('close',()=>{
        if(serverId){
            servers.delete(serverId);
            delete serverRooms[serverId];
            console.log(`Server ${serverId} disconnected`);
        }
    });
    ws.on('error',(err)=>{
        console.error(`WebSocket error: ${err.message}`);
    });

});
console.log('WebSocket server is running on ws://localhost:9000');