const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const devices = require('puppeteer-core/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

module.exports = (req, res) => {

  (async () => {
    // Set up browser and page.
    const { string = 'bts',count = 50,hl="vi",gl="VN" } = req.query
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': `${hl}-${gl}`
    });
    await page.emulate(iPhone);
    
  
    await page.goto(`https://m.youtube.com/results?search_query=${string}`);
  
    const items = await scrapeInfiniteScrollItems(page, extractItems, count);
    res.send(JSON.stringify(items))
  
    // Close the browser.
    await browser.close();
  })();
}

function extractItems() {
    let titles=[]
    let links=[]
    let ids=[]
    let authors=[]
    let viewCounts=[]
    let times=[]

    //xoa link khong phai video
    let container= Array.from(document.querySelectorAll('.compact-media-item-metadata-content'))
    for( var i = 0; i < container.length; i++){ 
          if ((!container[i].href.includes("watch?v=")) || (container[i].href.includes("start_radio")) ) {
            container.splice(i, 1); 
          }
        }
    
    for( var i = 0; i < container.length; i++){
      links[i]=container[i].href
      ids[i]=links[i].substring(links[i].indexOf("?v=")+3)
      if (container[i].firstChild.tagName==="H4") {
        titles[i]=(container[i].firstChild)?container[i].firstChild.innerText:""
        authors[i]=(container[i].firstChild.nextSibling.firstChild)?container[i].firstChild.nextSibling.firstChild.innerText:""
        viewCounts[i]=(container[i].firstChild.nextSibling.firstChild.nextSibling)?container[i].firstChild.nextSibling.firstChild.nextSibling.innerText:""
        times[i]=(container[i].firstChild.nextSibling.firstChild.nextSibling.nextSibling)?container[i].firstChild.nextSibling.firstChild.nextSibling.nextSibling.innerText:""
      }
      else if(container[i].firstChild.tagName==="YTM-BADGE-SUPPORTED-RENDERER"){
        titles[i]=(container[i].firstChild.nextSibling)?container[i].firstChild.nextSibling.innerText:""
        authors[i]=(container[i].firstChild.nextSibling.nextSibling.firstChild)?container[i].firstChild.nextSibling.nextSibling.firstChild.innerText:""
        viewCounts[i]=(container[i].firstChild.nextSibling.nextSibling.firstChild.nextSibling)?container[i].firstChild.nextSibling.nextSibling.firstChild.nextSibling.innerText:""
        times[i]=(container[i].firstChild.nextSibling.nextSibling.firstChild.nextSibling.nextSibling)?container[i].firstChild.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.innerText:""
      } else{
        titles[i]=""
        authors[i]=""
        viewCounts[i]=""
        times[i]=""
      }
   }
    let items=[]
    for (let i=0;i<container.length;i++){
      let singleItemInfo=
        {
          "link":links[i]
        ,
          "id":ids[i]
        ,
          "title":titles[i]
        ,
          "author":authors[i]
        ,
          "view":viewCounts[i]
        ,
          "time":times[i]
        }
      items[i]=singleItemInfo
    }

    return items
    
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
        previousHeight = await page.evaluate('document.querySelector("#app").scrollHeight');
        await page.evaluate('window.scrollTo(0, document.querySelector("#app").scrollHeight)');
        await page.waitForFunction(`document.querySelector("#app").scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);
      }
    } catch(e) { }
    return items;
  }
  
