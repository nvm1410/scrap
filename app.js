const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const express= require("express");
const app=express();
app.get("/",function (req,res){
   
    (async () => {
        // Set up browser and page.
        const browser = await puppeteer.launch({
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
      });
        const page = await browser.newPage();
        page.setViewport({ width: 1280, height: 720 });
      
        // Navigate to the demo page.
        await page.goto('https://www.youtube.com/results?search_query=bts');
      
        const items = await scrapeInfiniteScrollItems(page, extractItems, 100);
        res.end(JSON.stringify(items))
      
        // Close the browser.
        await browser.close();
      })();
    
})    



function extractItems() {
    const extractedElements = Array.from(document.querySelectorAll('#video-title'));
    const items = [];
    for (let element of extractedElements) {
      items.push(element.href);
    }
    return items;
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
        previousHeight = await page.evaluate('document.querySelector("ytd-app").scrollHeight');
        await page.evaluate('window.scrollTo(0, document.querySelector("ytd-app").scrollHeight)');
        await page.waitForFunction(`document.querySelector("ytd-app").scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);
      }
    } catch(e) { }
    return items;
  }module.exports = (req, res) => {
  const { name = 'World' } = req.query
  res.send(`Hello ${name}!`)
}
  app.listen(3000, function(){
    console.log("Server has started 123");
})