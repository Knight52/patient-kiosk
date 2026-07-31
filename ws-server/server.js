require('dotenv').config();
const { createServer } = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

// Plain HTTP server — handles health checks and upgrades to WS
const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ noServer: true });

// Track rooms manually — raw ws has no built-in room concept
const rooms = new Map(); // room -> Set of sockets

function send(ws, type, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

function broadcastToRoom(room, type, payload, exclude = null) {
  const members = rooms.get(room);
  if (!members) return;
  members.forEach((client) => {
    if (client !== exclude) {send(client, type, payload);}
  });
}
function findRoomBySocket(ws)
{
	
}

// Manual origin check + upgrade handling
httpServer.on('upgrade', (req, socket, head) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS[0] !== '*' && !ALLOWED_ORIGINS.includes(origin)) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws) => {
  ws.id = randomUUID();
  ws.rooms = new Set();
  ws.isAlive = true;

  console.log(`Client connected: ${ws.id}`);
  send(ws, 'welcome', { message: 'Connected to server', id: ws.id });

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return send(ws, 'error', { message: 'Invalid JSON' });
    }

    switch (msg.type) {
      case 'message': {
        // broadcast to everyone except sender
        wss.clients.forEach((client) => {
          if (client !== ws) send(client, 'message', { data: msg.data, from: ws.id });
        });
        break;
      }

      case 'join-room': {
        const { room, state } = msg;
        if (!rooms.has(room)) rooms.set(room, new Set());
        rooms.get(room).add(ws);
        ws.rooms.add(room);

		if(state)
		{
			formState = rooms.get(room)?.state;
			if(!formState)
			{
				formState = {};
			}
			formState.state = state;
			rooms.get(room).state = formState;
		}
        broadcastToRoom(room, 'room-message', {
          system: true,
          text: `${ws.id} joined ${room}`,
		  form: rooms.get(room).form,
          users: rooms.get(room).size,
		  state: rooms.get(room).state.state
        });
        break;
      }

      case 'leave-room': {
        const { room } = msg;
        rooms.get(room)?.delete(ws);
        ws.rooms.delete(room);

        broadcastToRoom(room, 'room-message', {
          system: true,
          text: `${ws.id} left ${room}`,
          users: rooms.get(room)?.size || 0,
        });
        break;
      }

      case 'room-message': {
        const { room, name, value, state } = msg;
		if(name)  
		{
			form = rooms.get(room)?.form;
			if(!form)
			{
				form = {};
			}
			form[name] = value;
			rooms.get(room).form = form;
		}
		if(state)
		{
			formState = rooms.get(room)?.state;
			if(!formState)
			{
				formState = {};
			}
			formState.state = state;
			rooms.get(room).state = formState;
			if(state == "setup")
			{
				rooms.get(room).form = {};
			}
			broadcastToRoom(room, 'room-message', { state: state, from: ws.id, system: false });
		}
		else
		{
			broadcastToRoom(room, 'room-message', { name: name, value: value, from: ws.id, system: false });
		}
        break;
      }

      default:
        send(ws, 'error', { message: `Unknown type: ${msg.type}` });
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${ws.id}`);
    ws.rooms.forEach((room) => {
      const members = rooms.get(room);
      if (members) {
        members.delete(ws);
        broadcastToRoom(room, 'room-message', {
          system: true,
          text: `${ws.id} left ${room}`,
          users: members.size,
        });
      }
    });
  });

  ws.on('error', (err) => {
    console.error(`Socket error (${ws.id}):`, err.message);
  });
});

// Heartbeat — detects dead connections (e.g. network drop without close frame)
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(heartbeat));

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});