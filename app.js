const puppeteer = require('puppeteer');
const youtube = require('./youtube');
const express= require("express");
const app=express();
app.get("/",function (req,res){
    // try {
    //     (async () => {
    
    //         let keywords = [
    //             'bts', 
    //         ];
    
    //         const browser = await puppeteer.launch();
    //         let results = await youtube.scrape_youtube(browser, keywords);
    //         res.render(results, {depth: null, colors: true});
    
    //         await browser.close();
    
    //     })()
    // } catch (err) {
    //     console.error(err)
    // }
    res.render("hello")
})


app.listen(process.env.PORT,process.env.IP, function(){
    console.log("Server has started");
})