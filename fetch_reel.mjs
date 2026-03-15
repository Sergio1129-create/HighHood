import puppeteer from 'puppeteer';
import * as fs from 'fs';

async function fetchReel() {
    const url = process.argv[2];
    console.log('Fetching reel from:', url);
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2' });

    try {
        const videoSrc = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? video.src : null;
        });

        const posterSrc = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? video.poster : null;
        });

        console.log(JSON.stringify({
            success: true,
            videoUrl: videoSrc,
            posterUrl: posterSrc
        }));
    } catch (error) {
        console.log(JSON.stringify({ success: false, error: error.message }));
    }

    await browser.close();
}

fetchReel();
