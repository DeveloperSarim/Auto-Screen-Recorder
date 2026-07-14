# 🎬 Auto Screen Recorder

Kisi bhi website ka URL do, ye us page ko **smooth auto-scroll** karte hue record karke ek **MP4 video** bana deta hai. Do tareeqe se use kar sakte hain: ek **web app** (browser me URL daalo) aur ek **CLI**.

Built with [Puppeteer](https://pptr.dev/) + [puppeteer-screen-recorder](https://www.npmjs.com/package/puppeteer-screen-recorder).

---

## ✨ Features

- 🌐 **Web UI** — URL daalo, Record dabao, video preview + download
- 💻 **CLI** — `node index.js <url>`
- 🎥 1080p @ 60fps, smooth steady scroll
- 🧹 Web version har recording ke baad temp file cleanup karta hai
- 🔒 Ek waqt me ek recording (memory safe)

---

## 🖥️ Local par chalana

```bash
# 1. Dependencies install
npm install --legacy-peer-deps

# 2. Web app start
npm start
# -> http://localhost:3000 kholo

# Ya CLI se:
node index.js https://example.com
# -> website_scroll.mp4 ban jayegi
```

> **Note:** `--legacy-peer-deps` is liye chahiye kyunki `puppeteer-screen-recorder` purane puppeteer ka peer maangta hai, magar runtime par naye ke saath theek chalta hai.

---

## ☁️ VPS (Hostinger/Ubuntu) par deploy

```bash
# 1. Node.js 20 install (agar nahi hai)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Puppeteer/Chrome ke Linux system dependencies
sudo apt-get update && sudo apt-get install -y \
  ca-certificates fonts-liberation libasound2t64 libatk-bridge2.0-0 \
  libatk1.0-0 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxdamage1 libxext6 \
  libxfixes3 libxrandr2 libxrender1 libxkbcommon0 libxshmfence1 wget

# 3. Naya folder + clone
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/DeveloperSarim/Auto-Screen-Recorder.git
cd Auto-Screen-Recorder

# 4. Dependencies + Chromium
npm install --legacy-peer-deps
npx puppeteer browsers install chrome

# 5. pm2 se background me chalao (unique port 8420)
sudo npm install -g pm2
PORT=8420 pm2 start server.js --name screen-recorder
pm2 save
pm2 startup     # jo command print ho, use bhi chalao (reboot par auto-start)

# 6. Firewall me port kholo
sudo ufw allow 8420
```

Ab app yahan chalega: **`http://<VPS_IP>:8420`**

### Useful pm2 commands
```bash
pm2 logs screen-recorder     # live logs
pm2 restart screen-recorder  # restart
pm2 stop screen-recorder     # rok do
pm2 list                     # sab apps
```

---

## ⚙️ Settings badalna

[`recorder.js`](recorder.js) me:

| Cheez | Variable | Default |
|-------|----------|---------|
| Scroll speed | `pixelsPerSecond` | `250` (kam = slow + smooth) |
| FPS / quality | recorder config `fps`, `videoCrf` | `60`, `24` |
| Max scroll time | `maxScrollMs` | `120000` (2 min cap) |

---

## 📄 License

ISC
