# Quick Start Guide - Stream App

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd "path/to/your/GitHub/folder"
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
🎥 Stream App Signaling Server
Status: Running
Host URL: http://localhost:3000/host.html
```

### Step 3: Open Host Page
- Open browser → `http://localhost:3000/host.html`
- You'll see a unique session link generated

### Step 4: Share Link with Guest
- Copy the link displayed on host page
- Guest opens the link in another browser tab/window or device

### Step 5: Guest Grants Camera Access
- Guest clicks "Grant Camera Access"
- Approves browser prompt for camera
- Video stream appears on host dashboard

### Step 6: Test Camera Control
- Host clicks "Switch to Front Camera" or "Switch to Back Camera"
- Guest approves permission when prompted
- Guest's camera switches and new feed shows

---

## 🎯 Common Tasks

### Test Locally (Same Computer)
1. Start server: `npm start`
2. Host: `http://localhost:3000/host.html` (in Tab 1)
3. Guest: Copy the link and open in Tab 2
4. Grant permissions and test camera switch

### Test on Network (Different Computers)
1. Find your IP: Run `ipconfig` in PowerShell, get IPv4 Address (e.g., 192.168.1.100)
2. Start server on your machine: `npm start`
3. Host: `http://192.168.1.100:3000/host.html`
4. Guest (on other computer): Copy link from host page
5. Both grant permissions and test

### Test on Mobile Device
1. Start server: `npm start`
2. Get your computer's IP: `ipconfig`
3. On mobile: Open `http://[your-ip]:3000/host.html` or the guest link
4. Grant permissions
5. Mobile camera will stream to desktop (or vice versa)

---

## 📋 Files Overview

| File | Purpose |
|------|---------|
| `server.js` | Node.js signaling server - manages WebRTC handshake |
| `host.html` | Host dashboard - view guest stream & control cameras |
| `guest.html` | Guest page - share camera with host |
| `package.json` | Node.js dependencies |
| `README.md` | Full documentation |

---

## 🐛 Quick Troubleshooting

**Server won't start?**
- Check Node.js is installed: `node --version`
- Check dependencies: `npm install` again
- Verify port 3000 is free

**No camera access?**
- Browser security: Must use HTTPS or localhost
- Check browser camera permissions
- Device actually needs a camera attached

**Connection fails?**
- Server must be running: `npm start`
- Check firewall isn't blocking port 3000
- Both must be on same network for local testing

**Video not showing?**
- Refresh the page
- Check browser console (F12) for errors
- Verify camera permission was granted

---

## 🔐 Important Notes

✅ **HTTPS Required** for production - Camera access needs secure context  
✅ **User Consent** - Browser always asks for camera/mic permission  
✅ **P2P Only** - Media flows peer-to-peer, not through server  
✅ **No Recording** - Stream data doesn't save anywhere  

---

## 📱 Features Included

- ✅ Real-time WebRTC streaming
- ✅ Host controls guest camera (front/back)
- ✅ Unique session links for each session
- ✅ Auto-generate new session on every host access
- ✅ Beautiful responsive UI
- ✅ Live status indicators
- ✅ ICE candidate handling
- ✅ Graceful disconnection handling

---

## 🚀 Next Steps

1. **Test locally** - Verify everything works on your machine
2. **Read README.md** - Full documentation and advanced setup
3. **Deploy to cloud** - Host on Heroku, AWS, or own server
4. **Add authentication** - User login/session validation
5. **Add recording** - Save video streams to file
6. **Multi-guest support** - Extend for multiple guests
7. **Custom UI** - Modify HTML/CSS to match your design

---

**Server running successfully? You're all set!** 🎉

For more detailed documentation, see `README.md`
