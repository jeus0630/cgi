const fs = require('fs');

const getParameter = {};
if(process.env["QUERY_STRING"]){
    process.env["QUERY_STRING"].split("&").forEach(data=>{
        getParameter[data.split("=")[0]] = decodeURIComponent(data.split("=")[1].replace(/\+/g," "));
    })
}


const articles = JSON.parse(fs.readFileSync("articles.json").toString());

articles[getParameter.num].hitcount += 1;
fs.writeFileSync("articles.json",Buffer.from(JSON.stringify(articles)));

let html = "<html><head><meta charset='utf-8'><title>게시물 상세보기</title></head><body>";
html += "<p>제목: "+articles[getParameter.num].subject+"</p>";
html += "<p>작성자: "+articles[getParameter.num].writer+"</p>";
html += "<p>조회수: "+articles[getParameter.num].hitcount+"</p>";
html += "<p>본문: "+articles[getParameter.num].content+"</p>";
html += "<a href='/cgi/list.js'>목록으로 돌아가기</a></body></html>"
const buf = Buffer.from(html);
console.log("Content-Type: text/html");
console.log("Content-length: " + buf.length);
process.stdout.write(Buffer.from("\r\n"));
process.stdout.write(buf);
process.stdout.write(Buffer.from("\r\n"));