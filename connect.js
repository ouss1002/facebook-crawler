const puppeteer = require('puppeteer');
const devices = puppeteer.devices;
const rules = require('./utils/rules');
const fs = require('fs');

screenshotCounter = 1;

(async () => {
    const browser = await puppeteer.launch({
        executablePath: rules.pathToChrome,
        headless: rules.hideScreen,
        ignoreHTTPSErrors: true,
        userDataDir: './tmp',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
        ],
    });

    const page = await browser.newPage();

    const preloadFile = fs.readFileSync('./preload.js', 'utf8');
    await page.evaluateOnNewDocument(preloadFile);

    if(rules.emulate) {
        await page.emulate(devices[rules.device]);
    }
    
	page.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.dismiss();
    });

    await page.goto(rules.loginPage);
    await page.waitForSelector('input[type="email"]');
    await page.waitForSelector('input[type="password"]');
    
    await page.type('input[type="email"]', rules.email);
    await page.type('input[type="password"]', rules.password);

    await page.click('button[name="login"]');

    await page.waitForNavigation();

    await page.goto('https://www.facebook.com/');
})();

screenThis =  async (page) => {
    await page.screenshot({
        path: `screens/screen${screenshotCounter}.jpg`,
    });

    await screenshotCounter++;
};