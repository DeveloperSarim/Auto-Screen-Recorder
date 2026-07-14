const { recordWebsite } = require('./recorder');

// URL command line se de sakte hain, warna default
// Chalao:  node index.js https://example.com
const TARGET_URL =
    process.argv[2] || 'https://en.wikipedia.org/wiki/Artificial_intelligence';

(async () => {
    console.log('Browser open ho raha hai...');
    try {
        await recordWebsite({
            url: TARGET_URL,
            savePath: './website_scroll.mp4',
            onLog: (msg) => console.log(msg),
        });
        console.log('Done! Video "website_scroll.mp4" ke naam se save ho gayi hai.');
    } catch (err) {
        console.error('Error aa gaya:', err.message);
        process.exitCode = 1;
    }
})();
