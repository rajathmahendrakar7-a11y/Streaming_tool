@echo off
REM Stream App - Quick Commands Reference
REM This file documents all common commands

REM =========================================
REM SETUP COMMANDS
REM =========================================

REM Navigate to project folder
REM cd "C:\Users\Rajat\OneDrive\ドキュメント\GitHub"

REM Install all dependencies
REM npm install

REM =========================================
REM RUNNING THE APPLICATION
REM =========================================

REM Start the server (production)
REM npm start

REM Start with auto-reload (development)
REM npm run dev

REM =========================================
REM TESTING
REM =========================================

REM Open Host Dashboard
REM http://localhost:3000/host.html

REM Open Guest Page (use sessionId from host)
REM http://localhost:3000/guest.html?sessionId=abc12345

REM Access via IP (different computer)
REM http://192.168.1.100:3000/host.html

REM =========================================
REM TROUBLESHOOTING COMMANDS
REM =========================================

REM Check Node.js version
node --version

REM Check npm version
npm --version

REM List installed packages
npm list

REM Check for errors
REM npm run build

REM Clear npm cache
npm cache clean --force

REM Reinstall dependencies
REM Delete node_modules folder manually
REM Then run: npm install

REM =========================================
REM FINDING YOUR IP ADDRESS
REM =========================================

REM Run in PowerShell to get your IP
REM ipconfig
REM Look for IPv4 Address (e.g., 192.168.1.100)

REM =========================================
REM PORT CHECK
REM =========================================

REM Check if port 3000 is in use
REM netstat -ano | findstr :3000

REM Kill process using port 3000 (if needed)
REM taskkill /PID <PID> /F

REM =========================================
REM GIT COMMANDS
REM =========================================

REM Initialize git repo
REM git init

REM Add all files
REM git add .

REM Commit changes
REM git commit -m "Initial commit: Stream app"

REM =========================================
REM DEVELOPMENT
REM =========================================

REM Edit server.js in VS Code
REM code server.js

REM Edit host.html
REM code host.html

REM Edit guest.html
REM code guest.html

REM View server logs in real-time
REM npm start (watch the console output)

REM =========================================
REM DEPLOYMENT
REM =========================================

REM Create production build
REM npm run build

REM Start with Node process manager
REM npm install -g pm2
REM pm2 start server.js

REM Setup auto-start on reboot
REM pm2 startup
REM pm2 save

REM =========================================
REM QUICK START WORKFLOW
REM =========================================

REM 1. Open PowerShell and navigate to project
REM    cd "C:\Users\Rajat\OneDrive\ドキュメント\GitHub"

REM 2. Install dependencies
REM    npm install

REM 3. Start the server
REM    npm start

REM 4. In another PowerShell window, get your IP
REM    ipconfig

REM 5. Open browser to host page
REM    http://localhost:3000/host.html

REM 6. Copy the generated link

REM 7. Open another browser tab and paste the link
REM    http://localhost:3000/guest.html?sessionId=...

REM 8. Grant camera permission on guest page

REM 9. Test camera switching on host page

REM 10. Done! Stop server with Ctrl+C

REM =========================================
REM FILE LOCATIONS
REM =========================================

REM Project folder
REM C:\Users\Rajat\OneDrive\ドキュメント\GitHub

REM Server code
REM C:\Users\Rajat\OneDrive\ドキュメント\GitHub\server.js

REM Host page
REM C:\Users\Rajat\OneDrive\ドキュメント\GitHub\host.html

REM Guest page
REM C:\Users\Rajat\OneDrive\ドキュメント\GitHub\guest.html

REM Dependencies
REM C:\Users\Rajat\OneDrive\ドキュメント\GitHub\node_modules

REM Documentation
REM C:\Users\Rajat\OneDrive\ドキュメント\GitHub\README.md
REM C:\Users\Rajat\OneDrive\ドキュメント\GitHub\QUICKSTART.md

REM =========================================
REM ENVIRONMENT SETUP
REM =========================================

REM Create .env file for environment variables
REM PORT=3000
REM NODE_ENV=development

REM To use .env file, install dotenv:
REM npm install dotenv

REM Then in server.js add:
REM require('dotenv').config();

REM =========================================
REM USEFUL WINDOWS TERMINAL COMMANDS
REM =========================================

REM Start PowerShell
REM powershell

REM Change directory
REM cd "path\to\directory"

REM List files
REM dir

REM Create new folder
REM mkdir folder_name

REM Remove folder
REM rmdir /s folder_name

REM Clear screen
REM cls

REM =========================================
REM FOR PRODUCTION DEPLOYMENT
REM =========================================

REM Generate HTTPS certificates (self-signed for testing)
REM openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

REM Install PM2 globally
REM npm install -g pm2

REM Start app with PM2
REM pm2 start server.js --name "stream-app"

REM View running processes
REM pm2 list

REM View logs
REM pm2 logs stream-app

REM Restart app
REM pm2 restart stream-app

REM Stop app
REM pm2 stop stream-app

REM Delete app from PM2
REM pm2 delete stream-app

REM =========================================
REM DEBUGGING
REM =========================================

REM Enable verbose logging in server.js:
REM console.log('Debug message:', variable);

REM View browser console: F12 or Ctrl+Shift+J

REM View network traffic: F12 → Network tab

REM View WebRTC stats: F12 → Console
REM > peerConnection.getStats()

REM Check server logs: Look at terminal where npm start is running

REM =========================================
REM COMMON ISSUES & SOLUTIONS
REM =========================================

REM Problem: "npm: command not found"
REM Solution: Install Node.js from nodejs.org

REM Problem: Port 3000 already in use
REM Solution: Change PORT in server.js or kill process using port

REM Problem: Camera access denied
REM Solution: Check browser settings, use HTTPS

REM Problem: Connection timeout
REM Solution: Check firewall, ensure server is running

REM Problem: "Cannot find module"
REM Solution: Run npm install again

REM =========================================
REM SUMMARY
REM =========================================

REM Quick Start:
REM   1. npm install
REM   2. npm start
REM   3. Open http://localhost:3000/host.html
REM   4. Copy link and share with guest
REM   5. Grant camera access and test

REM For documentation, see:
REM   - README.md (complete guide)
REM   - QUICKSTART.md (quick setup)
REM   - CONFIGURATION.js (advanced options)

REM =========================================
REM Happy Streaming! 🎥
REM =========================================
