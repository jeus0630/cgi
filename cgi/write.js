const fs = require('fs');

const getParameter = {};
if(process.env["QUERY_STRING"]){
    process.env["QUERY_STRING"].split("&").forEach(data=>{
        getParameter[data.split("=")[0]] = decodeURIComponent(data.split("=")[1].replace(/\+/g," "));
    })
}

const articles = JSON.parse(fs.readFileSync("articles.json").toString());
articles.unshift({subject:getParameter.subject, writer:getParameter.writer, content:getParameter.content, hitcount:0});
fs.writeFileSync("articles.json",Buffer.from(JSON.stringify(articles)));

let html = "<html><head><script>location.href='/cgi/list.js';</script></head></html>";
const buf = Buffer.from(html);
console.log("Content-Type: text/html");
console.log("Content-length: " + buf.length);
process.stdout.write(Buffer.from("\r\n"));
process.stdout.write(buf);
process.stdout.write(Buffer.from("\r\n"));
