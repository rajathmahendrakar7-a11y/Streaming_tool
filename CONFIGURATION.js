// ============================================
// Stream App - Configuration & Customization
// ============================================

/**
 * This file documents all configuration options
 * Modify these settings to customize the app
 */

// ============================================
// 1. SERVER CONFIGURATION (server.js)
// ============================================

// Change server port
const PORT = process.env.PORT || 3000;

// Add logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Enable CORS for specific origins (production)
const corsOptions = {
    origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
    methods: ['GET', 'POST'],
    credentials: true
};
app.use(cors(corsOptions));

// ============================================
// 2. WEBRTC CONFIGURATION
// ============================================

// Add TURN servers for better NAT traversal
const ICE_SERVERS = [
    // STUN servers (free, for NAT type detection)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    
    // TURN servers (required when direct connection fails)
    {
        urls: 'turn:turn.example.com:3478',
        username: 'user',
        credential: 'password'
    },
    {
        urls: 'turns:turn.example.com:5349',
        username: 'user',
        credential: 'password'
    }
];

// Peer Connection Configuration
const peerConnectionConfig = {
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
};

const peerConnection = new RTCPeerConnection(peerConnectionConfig);

// ============================================
// 3. MEDIA STREAM CONFIGURATION
// ============================================

// High quality video (suitable for desktop)
const highQualityConstraints = {
    video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 },
        frameRate: { ideal: 30 }
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    }
};

// Low bandwidth video (suitable for mobile)
const lowBandwidthConstraints = {
    video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 640, min: 320 },
        height: { ideal: 480, min: 240 },
        frameRate: { ideal: 15 }
    },
    audio: true
};

// Mobile optimized
const mobileConstraints = {
    video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 24 }
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
    }
};

// Get appropriate constraints based on device
function getMediaConstraints() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        return mobileConstraints;
    }
    
    // Check bandwidth
    if (navigator.connection) {
        const effectiveType = navigator.connection.effectiveType; // 4g, 3g, 2g
        
        if (effectiveType === '2g' || effectiveType === '3g') {
            return lowBandwidthConstraints;
        }
    }
    
    return highQualityConstraints;
}

// Usage in getUserMedia
const constraints = getMediaConstraints();
localStream = await navigator.mediaDevices.getUserMedia(constraints);

// ============================================
// 4. SESSION MANAGEMENT
// ============================================

// Configure session timeout (in milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Clean up expired sessions
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
        if (now - session.createdAt > SESSION_TIMEOUT) {
            sessions.delete(sessionId);
            console.log(`Session ${sessionId} expired`);
        }
    }
}, 60000); // Check every minute

// ============================================
// 5. LOGGING & MONITORING
// ============================================

// Extended logging
class SessionLogger {
    static log(sessionId, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${sessionId}] ${message}`;
        console.log(logMessage);
        
        // Could also save to file or database
        // fs.appendFileSync('logs/session.log', logMessage + '\n');
    }
}

// Usage
SessionLogger.log(sessionId, 'Guest joined');
SessionLogger.log(sessionId, 'Camera switch requested');

// Monitor WebRTC stats
async function monitorConnection(peerConnection) {
    const stats = await peerConnection.getStats();
    
    stats.forEach(report => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
            console.log('Video stats:', {
                bytesReceived: report.bytesReceived,
                packetsLost: report.packetsLost,
                framesDecoded: report.framesDecoded,
                frameRate: report.framesPerSecond
            });
        }
        
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            console.log('Connection stats:', {
                currentRoundTripTime: report.currentRoundTripTime,
                availableOutgoingBitrate: report.availableOutgoingBitrate,
                availableIncomingBitrate: report.availableIncomingBitrate
            });
        }
    });
}

// ============================================
// 6. SECURITY CONFIGURATION
// ============================================

// HTTPS for production
const https = require('https');
const fs = require('fs');

const httpsOptions = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

const httpsServer = https.createServer(httpsOptions, app);

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Permissions-Policy', 'microphone=(), camera=()');
    next();
});

// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// ============================================
// 7. CAMERA SWITCHING OPTIMIZATION
// ============================================

// Cache media tracks for faster switching
class TrackManager {
    constructor() {
        this.currentCamera = null; // 'user' | 'environment' or deviceId
        this.currentDeviceId = null;
        this.lastVideoTrackId = null;
    }

    async getStreamByFacingMode(camera) {
        const constraints = {
            video: {
                facingMode: { ideal: camera },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        };

        return navigator.mediaDevices.getUserMedia(constraints);
    }

    async getStreamByDeviceId(deviceId) {
        const constraints = {
            video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
        };

        return navigator.mediaDevices.getUserMedia(constraints);
    }

    async listVideoInputs() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(d => d.kind === 'videoinput');
    }

    async replaceSendersWithStream(stream) {
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        const senders = peerConnection.getSenders();
        for (const sender of senders) {
            if (sender.track?.kind === 'video' && videoTrack) {
                await sender.replaceTrack(videoTrack);
            } else if (sender.track?.kind === 'audio' && audioTrack) {
                await sender.replaceTrack(audioTrack);
            }
        }
    }

    async switchCamera(target) {
        // target may be 'user' / 'environment' (facingMode) or a deviceId
        try {
            // 1) Try facingMode first when caller passes 'user' or 'environment'
            if (target === 'user' || target === 'environment') {
                const stream = await this.getStreamByFacingMode(target);
                const videoTrack = stream.getVideoTracks()[0];

                // If the returned track is the same as current, consider fallback
                if (this.lastVideoTrackId && videoTrack && videoTrack.id === this.lastVideoTrackId) {
                    stream.getTracks().forEach(t => t.stop());
                    throw new Error('FacingMode did not switch camera');
                }

                await this.replaceSendersWithStream(stream);
                this.currentCamera = target;
                this.currentDeviceId = videoTrack.getSettings?.().deviceId || null;
                this.lastVideoTrackId = videoTrack.id;
                return stream;
            }

            // 2) If target is a deviceId, try selecting it directly
            if (typeof target === 'string' && target.length > 0) {
                const stream = await this.getStreamByDeviceId(target);
                await this.replaceSendersWithStream(stream);
                const videoTrack = stream.getVideoTracks()[0];
                this.currentDeviceId = videoTrack.getSettings?.().deviceId || target;
                this.lastVideoTrackId = videoTrack.id;
                return stream;
            }
        } catch (err) {
            // Fallback: enumerate devices and pick a different deviceId
            console.warn('FacingMode switch failed, falling back to deviceId method:', err?.message || err);
            const videoInputs = await this.listVideoInputs();

            if (videoInputs.length < 2) {
                // Likely a virtual single camera (Link to Windows). Inform user.
                alert('Multiple physical cameras not available. Open the guest page in your phone browser (not via Link to Windows) to switch cameras.');
                throw new Error('No alternative video input available');
            }

            // Choose a device different from currentDeviceId (if known)
            const alternative = videoInputs.find(d => d.deviceId !== this.currentDeviceId) || videoInputs[0];
            const stream = await this.getStreamByDeviceId(alternative.deviceId);
            await this.replaceSendersWithStream(stream);

            const videoTrack = stream.getVideoTracks()[0];
            this.currentDeviceId = alternative.deviceId;
            this.lastVideoTrackId = videoTrack.id;
            this.currentCamera = 'device:' + alternative.deviceId;
            return stream;
        }

        // If we reach here without returning, try a safe enumerate fallback
        const videoInputs = await this.listVideoInputs();
        if (videoInputs.length < 2) {
            alert('Multiple physical cameras not available. Open the guest page in your phone browser (not via Link to Windows) to switch cameras.');
            throw new Error('No alternative video input available');
        }

        const alternative = videoInputs.find(d => d.deviceId !== this.currentDeviceId) || videoInputs[0];
        const stream = await this.getStreamByDeviceId(alternative.deviceId);
        await this.replaceSendersWithStream(stream);
        const videoTrack = stream.getVideoTracks()[0];
        this.currentDeviceId = alternative.deviceId;
        this.lastVideoTrackId = videoTrack.id;
        this.currentCamera = 'device:' + alternative.deviceId;
        return stream;
    }
}

// ============================================
// 8. ERROR HANDLING
// ============================================

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log to monitoring service
    // sendToMonitoring({ error: reason, promise });
});

// Socket error handling
socket.on('error', (error) => {
    console.error(`Socket error [${socket.id}]:`, error);
    
    if (socket.data.role === 'host') {
        const session = sessions.get(socket.data.sessionId);
        if (session?.guestSocket) {
            session.guestSocket.emit('error', { message: 'Host connection error' });
        }
    }
});

// ============================================
// 9. DATABASE INTEGRATION (Optional)
// ============================================

// Store session metadata in database
async function saveSession(sessionId, metadata) {
    // Example: MongoDB
    const db = require('mongodb');
    const client = new db.MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        const collection = client.db('stream_app').collection('sessions');
        
        await collection.insertOne({
            sessionId,
            createdAt: new Date(),
            metadata
        });
    } finally {
        await client.close();
    }
}

// ============================================
// 10. ANALYTICS
// ============================================

// Track connection metrics
class Analytics {
    static trackSessionCreated(sessionId) {
        // Send to analytics service
        console.log('Event: Session created', sessionId);
    }
    
    static trackGuestJoined(sessionId) {
        console.log('Event: Guest joined', sessionId);
    }
    
    static trackCameraSwitch(sessionId, camera) {
        console.log('Event: Camera switched', { sessionId, camera });
    }
    
    static trackSessionEnded(sessionId, duration) {
        console.log('Event: Session ended', { sessionId, durationMs: duration });
    }
}

// ============================================
// USAGE EXAMPLE
// ============================================

/*
// In your application:

1. Server setup:
   const constraints = getMediaConstraints();
   const peerConnection = new RTCPeerConnection(peerConnectionConfig);

2. Camera switching:
   const trackManager = new TrackManager();
   await trackManager.switchCamera('environment');

3. Monitoring:
   setInterval(() => {
       monitorConnection(peerConnection);
   }, 5000);

4. Logging:
   SessionLogger.log(sessionId, 'User action');
   Analytics.trackSessionCreated(sessionId);
*/

// ============================================
// ENVIRONMENT VARIABLES (.env)
// ============================================

/*
# Add to .env file in project root:

PORT=3000
NODE_ENV=development

# STUN/TURN Servers
STUN_SERVER_1=stun:stun.l.google.com:19302
TURN_SERVER=turn:your-server.com:3478
TURN_USERNAME=user
TURN_PASSWORD=password

# Database
DB_HOST=localhost
DB_PORT=27017
DB_NAME=stream_app

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id
ANALYTICS_KEY=your-analytics-key
*/
