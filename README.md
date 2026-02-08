# 🎥 Web-Based Dual Camera Streaming App

A real-time video streaming application that enables a host to view and control camera feeds from a guest's mobile device using WebRTC technology.

## Features

✅ **Live Streaming** - Real-time peer-to-peer video transmission via WebRTC  
✅ **Dual Camera Control** - Host can request guest to switch between front and back cameras  
✅ **Unique Session Links** - Each host session generates a unique link for guests  
✅ **Secure HTTPS Support** - Required for camera access  
✅ **Low Latency** - Peer-to-peer connection ensures minimal delay  
✅ **Cross-Browser Compatible** - Works on Chrome, Firefox, Safari, and Edge  

## Architecture

```
┌─────────────────────────────────────────────┐
│          Signaling Server (Node.js)         │
│  - Session Management                       │
│  - WebRTC Handshake (SDP exchange)          │
│  - ICE Candidate Routing                    │
└─────────────────────────────────────────────┘
         ↑                      ↑
         │ Socket.IO            │ Socket.IO
         │                      │
    ┌────┴─────┐            ┌──┴────────┐
    │   HOST    │  ←WebRTC→  │   GUEST   │
    │ Dashboard │   P2P      │   Camera  │
    └───────────┘            └───────────┘
```

## Tech Stack

- **Frontend**: HTML5, JavaScript, WebRTC APIs
- **Backend**: Node.js, Express.js, Socket.IO
- **Communication**: WebRTC for media, Socket.IO for signaling
- **ICE Servers**: Google STUN servers (fallback)

## Project Structure

```
stream_app/
├── server.js           # Signaling server
├── host.html          # Host dashboard
├── guest.html         # Guest camera sharing page
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## Installation & Setup

### Prerequisites
- Node.js 14+ installed
- npm (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Camera and microphone on your device

### Step 1: Install Dependencies

```bash
cd "path/to/GitHub"
npm install
```

This installs:
- `express` - Web framework
- `socket.io` - Real-time bidirectional communication
- `cors` - Cross-Origin Resource Sharing
- `uuid` - Unique session ID generation

### Step 2: Start the Server

```bash
npm start
```

Expected output:
```
╔════════════════════════════════════════╗
║   🎥 Stream App Signaling Server       ║
║   Status: Running                      ║
╠════════════════════════════════════════╣
║ Host URL:  http://192.168.x.x:3000/host.html
║ Guest:     http://192.168.x.x:3000/guest.html
║ Server:    http://192.168.x.x:3000
╚════════════════════════════════════════╝
```

### Step 3: Access the App

#### For Development (Local Testing)

**As Host:**
```
http://localhost:3000/host.html
```

**As Guest (from another tab/device):**
```
http://localhost:3000/guest.html?sessionId=<generated-id>
```

#### For Remote Access

Replace `localhost` with your machine's IP address:

**Get your IP:**
```bash
# On Windows PowerShell
ipconfig

# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Share with guests:**
```
http://192.168.1.100:3000/host.html
```

Host will generate a unique link. Share that link with guests.

## User Flow

### 1. **Host Creates Session**
   - Opens `http://localhost:3000/host.html`
   - Unique session link is auto-generated
   - Click "Copy Link" button to copy the sharing link

### 2. **Guest Joins Session**
   - Clicks the link provided by host
   - Browser prompts for camera permission
   - Click "Grant Camera Access"
   - Video stream starts transmitting to host

### 3. **Host Controls Camera**
   - Sees guest's camera feed in the dashboard
   - Clicks "Switch to Front Camera" or "Switch to Back Camera"
   - Guest approves the camera access prompt
   - Camera switches and new feed transmits

### 4. **Disconnect**
   - Either party can disconnect
   - Session automatically closes
   - All connections and streams are cleaned up

## How It Works

### Session Management
1. Host joins → Server creates unique `sessionId`
2. Guest receives `sessionId` in URL parameter
3. Both establish WebRTC connection through signaling server

### WebRTC Signaling Flow
```
1. Guest creates RTCPeerConnection and getUserMedia()
2. Guest creates SDP Offer → sent to Host via Socket.IO
3. Host creates RTCPeerConnection, receives Offer
4. Host creates SDP Answer → sent to Guest via Socket.IO
5. Both exchange ICE candidates
6. P2P connection established → video flows directly
```

### Camera Switching
1. Host emits `requestCameraSwitch` with new `facingMode`
2. Guest receives request
3. Guest stops current stream
4. Guest calls `getUserMedia` with new `facingMode`
5. Guest replaces media tracks in WebRTC connection
6. New camera feed transmits to host

## Configuration

### Change Server Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000 to your port
```

### Add Custom STUN/TURN Servers
Edit the `ICE_SERVERS` in `host.html` and `guest.html`:
```javascript
const ICE_SERVERS = [
    { urls: ['stun:your-stun-server.com:3478'] },
    { 
        urls: ['turn:your-turn-server.com:3478'],
        username: 'user',
        credential: 'pass'
    }
];
```

### Enable HTTPS (Production)
For production deployment, use HTTPS with SSL certificates:
```javascript
const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync('path/to/key.pem'),
    cert: fs.readFileSync('path/to/cert.pem')
};
https.createServer(options, app).listen(3000);
```

## Security Considerations

⚠️ **Important:**
- **HTTPS Required**: Camera access (getUserMedia) requires secure context (HTTPS)
- **User Consent**: Browser always prompts for camera/mic permission
- **Session IDs**: Generated randomly (UUID), not guessable
- **No Recording**: Stream data doesn't persist on server
- **P2P Only**: Media doesn't pass through server (except signaling)

### For Production:
1. Use HTTPS/TLS certificates
2. Implement server-side session validation
3. Add user authentication/authorization
4. Implement rate limiting on signaling server
5. Use production-grade STUN/TURN servers
6. Add logging and monitoring
7. Implement WebRTC stats monitoring

## Troubleshooting

### "Camera permission denied"
- Browser permission was rejected
- Check browser settings → Privacy & Security → Camera
- Clear site data and try again
- Ensure site uses HTTPS (or localhost)

### "Connection timeout"
- Server not running (check `npm start`)
- Firewall blocking port 3000
- Check console for error messages

### "No camera found"
- Device doesn't have a camera
- Another app is using the camera
- Browser doesn't have permission

### "Video is black/blank"
- Camera permission granted but not showing
- Try refreshing the page
- Check browser console for errors
- Verify camera works in other apps

### "Audio not working"
- Microphone permission not granted
- Another app is using the microphone
- Check audio device settings

### "P2P connection fails"
- Network firewall blocking WebRTC
- STUN/TURN servers unreachable
- ISP blocking peer connections

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅ Full | Recommended |
| Firefox | ✅ Full | Works great |
| Safari  | ✅ Full | Requires HTTPS |
| Edge    | ✅ Full | Chromium-based |
| Opera   | ✅ Full | Chromium-based |

## Performance Tips

1. **Reduce Video Resolution** - Change constraints in `getUserMedia`:
   ```javascript
   video: {
       width: { ideal: 640 },  // Lower resolution
       height: { ideal: 480 },
       facingMode: { ideal: currentCamera }
   }
   ```

2. **Monitor Connection** - Check WebRTC stats:
   ```javascript
   peerConnection.getStats().then(report => {
       report.forEach(stat => {
           if (stat.type === 'inbound-rtp') {
               console.log('Bitrate:', stat.bytesReceived);
           }
       });
   });
   ```

3. **Use Multiple ICE Servers** - Add fallback servers for better connectivity

4. **Enable Simulcast** (for scaling) - Send multiple quality streams

## Scaling to Multiple Guests

For multiple simultaneous guests, use a **Media Server (SFU/MCU)**:

### Option 1: SFU (Selective Forwarding Unit)
- Low latency, medium server load
- Each guest connects to server and other guests
- Example: Jitsi, Medooze

### Option 2: MCU (Media Control Unit)
- Higher latency, lower bandwidth
- All media passes through server
- Example: Kurento, Asterisk

### Simple Multi-Guest Setup:
```javascript
// Modify host to accept multiple guests
guests.push({
    id: guestId,
    peerConnection: pc,
    stream: stream
});

// Show multiple video feeds
```

## API Reference

### Server Events

#### Host Events
- `hostJoin` - Host joins, receives `hostSessionCreated`
- `hostAnswer` - Host sends answer to guest
- `hostIceCandidate` - Host sends ICE candidate
- `requestCameraSwitch` - Host requests camera change

#### Guest Events
- `guestJoin` - Guest joins with sessionId
- `guestOffer` - Guest sends offer to host
- `guestIceCandidate` - Guest sends ICE candidate
- `guestDisconnect` - Guest disconnects

#### Server Broadcast
- `guestJoined` - Sent to host when guest joins
- `hostAnswer` - Sent to guest with host's SDP answer
- `hostIceCandidate` - Sent to guest with ICE candidate
- `guestDisconnected` - Sent when guest leaves

## Development

### Run with Auto-Reload
```bash
npm run dev
```
Requires `nodemon` (installed in devDependencies)

### View Server Logs
Check the console for signaling events:
```
[12:34:56] New connection: abc123
[HOST] abc123 created session: h8k3j2l9
[GUEST] def456 joined session: h8k3j2l9
[SIGNAL] Guest offer → Host (h8k3j2l9)
[SIGNAL] Host answer → Guest (h8k3j2l9)
[CONTROL] Host requested camera switch to: environment
```

## Deployment

### Deploy to Cloud

#### Heroku:
1. Add `Procfile`:
   ```
   web: node server.js
   ```
2. Deploy:
   ```bash
   git push heroku main
   ```

#### AWS EC2/Lightsail:
1. Install Node.js
2. Clone repo
3. Install dependencies
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   ```

#### Docker:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## License

MIT License - Feel free to use and modify

## Support

For issues, questions, or improvements:
1. Check the Troubleshooting section
2. Review browser console errors
3. Check server logs
4. Verify network connectivity

---

**Happy Streaming! 🎥**
