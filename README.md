# Facebook Page Crawler
# Description
*facebook-crawler* is an automated tool to crawl facebook pages
  - Pictures
  - Videos
  - Posts
  - /# of Comments
  - Reactions
  - etc.  
Made using [puppeteer](https://github.com/puppeteer/puppeteer/).  

## How to Use!
  - Clone the repo `git clone https://github.com/ouss1002/facebook-crawler`
  - Run `npm install`
  - Fill in the file `./utils/rules.js` witht the appropriate information
  - Launch `node ./connect.js` to connect with your account
  - Launch `node ./crawler.js`
  - The crawler may take some time downloading media
## After Crawling
The result of the crawling will be saved to the folder `./results/`  
Every profile has its own directory `./results/profile_id`

### Excel File
To generate the excel file:
  - Run `node ./excelizer.js`
  - Open `./data.xlsx`
  - Enjoy analytics