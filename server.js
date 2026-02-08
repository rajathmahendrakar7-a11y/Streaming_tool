const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store active sessions
const sessions = new Map();

// Session class
class Session {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.hostSocket = null;
        this.guestSocket = null;
        this.createdAt = Date.now();
    }
}

// Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Stream App - Ready</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    text-align: center;
                }
                h1 { color: #333; }
                p { color: #666; }
                .links { margin-top: 30px; }
                a {
                    display: inline-block;
                    margin: 10px;
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background 0.3s;
                }
                a:hover { background: #5568d3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎥 Stream App Server Running</h1>
                <p>Signaling server is active and ready for connections</p>
                <div class="links">
                    <a href="/host.html">👨‍💻 Open as Host</a>
                    <a href="/guest.html">📱 Open as Guest</a>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                    Server running on ${getLocalIP()}:3000
                </p>
            </div>
        </body>
        </html>
    `);
});

// Serve host and guest pages
app.get('/host.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'host.html'));
});

app.get('/guest.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'guest.html'));
});

// Socket.IO Events
io.on('connection', (socket) => {
    console.log(`[${new Date().toLocaleTimeString()}] New connection: ${socket.id}`);

    // Host joins
    socket.on('hostJoin', () => {
        const sessionId = uuidv4().substring(0, 8);
        const session = new Session(sessionId);
        session.hostSocket = socket;
        sessions.set(sessionId, session);

        socket.join(`session:${sessionId}`);
        socket.data.role = 'host';
        socket.data.sessionId = sessionId;

        console.log(`[HOST] ${socket.id} created session: ${sessionId}`);
        socket.emit('hostSessionCreated', { sessionId: sessionId });
    });

    // Guest joins
    socket.on('guestJoin', (data) => {
        const sessionId = data.sessionId;
        const session = sessions.get(sessionId);

        if (!session) {
            console.log(`[GUEST] Invalid session: ${sessionId}`);
            socket.emit('error', { message: 'Invalid or expired session' });
            return;
        }

        if (session.guestSocket && session.guestSocket.connected) {
            console.log(`[GUEST] Session ${sessionId} already has a guest`);
            socket.emit('error', { message: 'Session already has a guest connected' });
            return;
        }

        session.guestSocket = socket;
        socket.join(`session:${sessionId}`);
        socket.data.role = 'guest';
        socket.data.sessionId = sessionId;

        console.log(`[GUEST] ${socket.id} joined session: ${sessionId}`);

        // Notify host that guest joined
        if (session.hostSocket && session.hostSocket.connected) {
            session.hostSocket.emit('guestJoined', { guestId: socket.id });
        }
    });

    // Guest sends offer to host
    socket.on('guestOffer', (data) => {
        const session = sessions.get(data.sessionId);
        if (session && session.hostSocket && session.hostSocket.connected) {
            console.log(`[SIGNAL] Guest offer → Host (${data.sessionId})`);
            session.hostSocket.emit('guestOffer', {
                offer: data.offer,
                guestId: socket.id
            });
        }
    });

    // Host sends answer to guest
    socket.on('hostAnswer', (data) => {
        const session = sessions.get(data.sessionId);
        if (session && session.guestSocket && session.guestSocket.connected) {
            console.log(`[SIGNAL] Host answer → Guest (${data.sessionId})`);
            session.guestSocket.emit('hostAnswer', {
                answer: data.answer
            });
        }
    });

    // Guest ICE candidate
    socket.on('guestIceCandidate', (data) => {
        const session = sessions.get(data.sessionId);
        if (session && session.hostSocket && session.hostSocket.connected) {
            session.hostSocket.emit('guestIceCandidate', {
                candidate: data.candidate,
                guestId: socket.id
            });
        }
    });

    // Host ICE candidate
    socket.on('hostIceCandidate', (data) => {
        const session = sessions.get(data.sessionId);
        if (session && session.guestSocket && session.guestSocket.connected) {
            session.guestSocket.emit('hostIceCandidate', {
                candidate: data.candidate
            });
        }
    });

    // Host requests camera switch
    socket.on('requestCameraSwitch', (data) => {
        const session = sessions.get(data.sessionId);
        if (session && session.guestSocket && session.guestSocket.connected) {
            console.log(`[CONTROL] Host requested camera switch to: ${data.camera}`);
            session.guestSocket.emit('requestCameraSwitch', {
                camera: data.camera
            });
        }
    });

    // Guest disconnects
    socket.on('guestDisconnect', (data) => {
        const session = sessions.get(data.sessionId);
        if (session && session.hostSocket && session.hostSocket.connected) {
            session.hostSocket.emit('guestDisconnected');
            console.log(`[GUEST] ${socket.id} disconnected from session: ${data.sessionId}`);
        }
    });

    // Host disconnects
    socket.on('disconnect', () => {
        const sessionId = socket.data.sessionId;
        const role = socket.data.role;

        if (sessionId) {
            const session = sessions.get(sessionId);
            
            if (session) {
                if (role === 'host') {
                    console.log(`[HOST] ${socket.id} disconnected`);
                    if (session.guestSocket && session.guestSocket.connected) {
                        session.guestSocket.emit('hostDisconnected');
                    }
                    sessions.delete(sessionId);
                } else if (role === 'guest') {
                    console.log(`[GUEST] ${socket.id} disconnected`);
                    if (session.hostSocket && session.hostSocket.connected) {
                        session.hostSocket.emit('guestDisconnected');
                    }
                    session.guestSocket = null;
                }
            }
        }

        console.log(`[${new Date().toLocaleTimeString()}] Disconnected: ${socket.id}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
        console.error(`[ERROR] Socket error: ${error}`);
    });
});

// Helper function to get local IP
function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Server startup
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`
╔════════════════════════════════════════╗
║   🎥 Stream App Signaling Server       ║
║   Status: Running                      ║
╠════════════════════════════════════════╣
║ Host URL:  http://${ip}:${PORT}/host.html
║ Guest:     http://${ip}:${PORT}/guest.html
║ Server:    http://${ip}:${PORT}
╚════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
