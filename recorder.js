const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

/**
 * Ek website ko open karke smooth auto-scroll ke saath record karta hai.
 *
 * @param {Object}   opts
 * @param {string}   opts.url            - Jo website record karni hai
 * @param {string}   opts.savePath       - Output mp4 ka path
 * @param {number}  [opts.pixelsPerSecond=250] - Scroll speed (kam = slow + smooth)
 * @param {number}  [opts.maxScrollMs=120000]  - Infinite-scroll pages ke liye safety limit
 * @param {(msg:string)=>void} [opts.onLog] - Progress messages ke liye callback
 * @returns {Promise<string>} savePath
 */
async function recordWebsite({
    url,
    savePath,
    pixelsPerSecond = 180,
    maxScrollMs = 120000,
    onLog = () => {},
}) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        // Recorder config: 1080p @ 60fps = sabse smooth (file thodi badi hogi)
        const recorder = new PuppeteerScreenRecorder(page, {
            fps: 60,
            videoFrame: { width: 1920, height: 1080 },
            aspectRatio: '16:9',
            videoCrf: 24,                 // achhi quality par phir bhi controlled size
            videoCodec: 'libx264',
            videoPreset: 'fast',
            videoBitrate: 4000,           // 1080p60 ke liye
        });

        onLog('Website load ho rahi hai...');
        // domcontentloaded reliable hai — networkidle2 aksar busy sites (ads/live
        // connections) par kabhi idle nahi hota aur timeout de deta hai.
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Images/CSS render hone ke liye thoda extra settle time
        await new Promise((r) => setTimeout(r, 2500));

        onLog('Recording shuru...');
        await recorder.start(savePath);

        // Page render hone ke liye thoda wait
        await new Promise((r) => setTimeout(r, 1500));

        onLog('Smooth scroll ho rahi hai...');
        await page.evaluate(
            async (pps, maxMs) => {
                await new Promise((resolve) => {
                    // Time-based scroll: har frame par asli beeta hua waqt dekh kar
                    // scroll karta hai -> frame-rate se independent, bilkul smooth.
                    let done = false;
                    const finish = () => {
                        if (!done) { done = true; resolve(); }
                    };
                    // Safety: agar kisi wajah se rAF ruk jaye to bhi hang na ho
                    const watchdog = setTimeout(finish, maxMs);

                    let last = performance.now();
                    function step(now) {
                        if (done) return;
                        const dt = Math.min(now - last, 100); // bade jumps clamp
                        last = now;
                        window.scrollBy(0, (pps * dt) / 1000);

                        const atBottom =
                            window.innerHeight + window.scrollY >=
                            document.body.scrollHeight - 2;
                        if (atBottom) {
                            clearTimeout(watchdog);
                            finish();
                            return;
                        }
                        requestAnimationFrame(step);
                    }
                    requestAnimationFrame(step);
                });
            },
            pixelsPerSecond,
            maxScrollMs
        );

        // End par thoda wait
        await new Promise((r) => setTimeout(r, 1500));

        onLog('Recording save ho rahi hai...');
        await recorder.stop();

        return savePath;
    } finally {
        // Chahe error aaye ya na aaye, browser hamesha band ho (resource leak se bachao)
        await browser.close();
    }
}

module.exports = { recordWebsite };
