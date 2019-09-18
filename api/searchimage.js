
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');


module.exports = (req, res) => {

  (async () => {
    // Set up browser and page.
    const { string = 'bts' } = req.query
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'vi-VN,vi;q=0.5'
    });
    
  
    await page.goto(`https://www.google.com/search?tbm=isch&sxsrf=ACYBGNSvf-qQLMYZhlOQrK8ncAgEJ1wpsQ%3A1568801904020&source=hp&biw=1280&bih=616&ei=bwSCXYr9O9KGoAT1x6-QCQ&q=${string}&oq=${string}&gs_l=img.3..0l10.2867.3946..4167...0.0..0.95.815.10......0....1..gws-wiz-img.....10..35i362i39j35i39.VSDorTxjQpk&ved=0ahUKEwjK8NbBktrkAhVSA4gKHfXjC5IQ4dUDCAY&uact=5`);
  
    const items = await scrapeInfiniteScrollItems(page, extractImages, 300);
    res.send(JSON.stringify(items))
  
    // Close the browser.
    await browser.close();
  })();
}

function extractImages(){
    
    let imageLinks  = Array.from(document.querySelectorAll('img.rg_ic')).map(x=>x.previousSibling.parentNode.href)

    for( var i = 0; i < imageLinks.length; i++){ 
        if ((!imageLinks[i].includes("?imgurl=")) || (!imageLinks[i].includes("&imgrefurl")) ) {
            imageLinks.splice(i, 1); 
        }
    }

    let realLinks=imageLinks.map(x=>decodeURIComponent(x.substring(x.indexOf("?imgurl=")+8,x.indexOf("&imgrefurl"))))

    return realLinks
}

async function scrapeInfiniteScrollItems(
    page,
    extractItems,
    itemTargetCount,
    scrollDelay = 1000,
  ) {
    let items = [];
    try {
      let previousHeight;
      while (items.length < itemTargetCount) {
        items = await page.evaluate(extractItems);
        previousHeight = await page.evaluate('document.querySelector("#main").scrollHeight');
        await page.evaluate('window.scrollTo(0, document.querySelector("#main").scrollHeight)');
        await page.waitForFunction(`document.querySelector("#main").scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);
      }
    } catch(e) { }
    return items;
  }
  
