const puppeteer = require('puppeteer');
const devices = puppeteer.devices;
const rules = require('./utils/rules');
const fs = require('fs');
const getters = require('./utils/getters');
const funcs = require('./utils/funcs');

screenshotCounter = 1;

debDate = Date.parse(rules.startDate);
endDate = Date.parse(rules.endDate);

rules.links = funcs.normalizeLinks(rules.links);

profiles = {

};

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

    await page.goto('https://www.facebook.com/');

    try {
        await page.evaluate(() => {
            let ele = document.querySelector('.aOOlW.HoLwm');
            if(ele != null) {
                ele.click();
            }
        });

        try{
            await page.evaluate(() => {
                let ele = document.querySelector('.aOOlW.HoLwm');
                if(ele != null) {
                    ele.click();
                }
            });
        }
        catch(err){
            console.log(err);
        }
    }
    catch(err) {
        console.log(err);
    }

    result = await getters.crawlProfilesFromList(page, rules);

    console.log();
    console.log();
    console.log("Finished crawling process... you can excelize the data through './excelize.js'");

    console.log('Exiting Chrome...');
    await browser.close();
    console.log('Exited successfully');

})();

screenThis =  async (page) => {
    await page.screenshot({
        path: `screens/screen${screenshotCounter}.jpg`,
    });

    await screenshotCounter++;
};