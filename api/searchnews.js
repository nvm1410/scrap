
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');


module.exports = (req, res) => {

  (async () => {
    // Set up browser and page.
    const { string = 'bts',count = 100 } = req.query
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless
    });
    const page = await browser.newPage();
   
    
  
    await page.goto(`https://baomoi.com/tim-kiem/${string}.epi`);
  
    const items = await scrapeInfiniteScrollItems(page, extractNews, count);
    res.send(JSON.stringify(items))
  
    // Close the browser.
    await browser.close();
  })();
}

function extractNews(){
    let container =Array.from(document.querySelectorAll(".story"))
    for( var i = 0; i < container.length; i++){ 
      if (container[i].firstElementChild===null ) {
          container.splice(i, 1); 
      }
    }
    let images= container.map(x=>{
      if(x.firstElementChild.firstElementChild.firstElementChild!==null){
       return x.firstElementChild.firstElementChild.firstElementChild.src
      } else {
      return ""
      }
    })
    let imageLinks=images.map(x=>{
      if(x && x!==""){
          return x.substring(0,x.indexOf("w"))+x.substring(x.indexOf("_r")+6)
      } else {return ""}
    })
    let titlesAndLinks=container.map(x=>x.firstElementChild.nextElementSibling.firstElementChild)
    let titles=titlesAndLinks.map(x=>x.getAttribute("title"))
    let newsLinks=titlesAndLinks.map(x=>x.href)
    let metaData=container.map(x=>x.firstElementChild.nextElementSibling.nextElementSibling)
    let sources=metaData.map(x=>x.firstElementChild.innerText)
    let times=metaData.map(x=>{
       return x.firstElementChild.nextElementSibling.innerText
    })
    
    //loc tin bts
    let conditions = ["bts", "jin", "jimin","rm","suga","jungkook","j-hope", "army", " v "];
    for( var i = 0; i < container.length; i++){ 
      if (
        !conditions.some(el=>titles[i].toLowerCase().includes(el))
      ){
          titles[i]=null
          newsLinks[i]=null
          imageLinks[i]=null
          sources[i]=null
          times[i]=null
      } else {
          titles[i]=titles[i]
          newsLinks[i]=newsLinks[i]
          imageLinks[i]=imageLinks[i]
          sources[i]=sources[i]
          times[i]=times[i]
      }
    }
    titles = titles.filter(function (el) {
      return el != null;
    });
    newsLinks = newsLinks.filter(function (el) {
      return el != null;
    });
    imageLinks = imageLinks.filter(function (el) {
      return el != null;
    });
    sources = sources.filter(function (el) {
      return el != null;
    });
    times = times.filter(function (el) {
      return el != null;
    });

    let items=[]
    for (let i=0;i<titles.length;i++){
    
        let singleItemInfo=
        {
          "newsLink":newsLinks[i]
        ,
          "imageLink":imageLinks[i]
        ,
          "title":titles[i]
        ,
          "source":sources[i]
        ,
          "time":times[i]
       
        }
         items[i]=singleItemInfo
    } 
      
    // }
    
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
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);
      }
    } catch(e) { }
    return items;
  }
  
