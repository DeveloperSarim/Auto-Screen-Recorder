const express = require('express');
const path = require('path');
const fs = require('fs');
const { recordWebsite } = require('./recorder');

const app = express();
const PORT = process.env.PORT || 3000;

// Jahan temp recordings save hongi
const RECORDINGS_DIR = path.join(__dirname, 'recordings');
if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ek waqt me sirf ek recording (Chrome bhaari hai -> memory bachao)
let isBusy = false;

app.post('/record', async (req, res) => {
    const { url } = req.body || {};

    // ---- URL validation ----
    let parsed;
    try {
        parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch {
        return res
            .status(400)
            .json({ error: 'Sahi URL daalein (http:// ya https:// ke saath).' });
    }

    if (isBusy) {
        return res.status(429).json({
            error: 'Ek recording pehle se chal rahi hai. Thodi der baad try karein.',
        });
    }

    isBusy = true;
    const safeName = parsed.hostname.replace(/[^a-z0-9.-]/gi, '_');
    const fileName = `${safeName}-${Date.now()}.mp4`;
    const savePath = path.join(RECORDINGS_DIR, fileName);

    try {
        await recordWebsite({
            url,
            savePath,
            onLog: (msg) => console.log(`[${safeName}] ${msg}`),
        });

        // File bhejo, phir cleanup
        res.download(savePath, fileName, (err) => {
            if (err) console.error('Bhejne me masla:', err.message);
            fs.unlink(savePath, () => {}); // temp file delete
        });
    } catch (err) {
        console.error('Recording error:', err.message);
        fs.unlink(savePath, () => {}); // adhoori file delete
        if (!res.headersSent) {
            res.status(500).json({ error: 'Recording fail ho gayi: ' + err.message });
        }
    } finally {
        isBusy = false;
    }
});

// '0.0.0.0' -> saare network interfaces par sunega (bahar se access ke liye zaroori)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  Auto Screen Recorder chal raha hai:`);
    console.log(`  ->  http://localhost:${PORT}  (aur bahar se http://<VPS_IP>:${PORT})\n`);
});
