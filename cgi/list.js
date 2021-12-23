const fs = require('fs');

const getParameter = {};
if(process.env["QUERY_STRING"]){
    process.env["QUERY_STRING"].split("&").forEach(data=>{
        getParameter[data.split("=")[0]] = decodeURIComponent(data.split("=")[1].replace(/\+/g," "));
    })
}

let curPage = 1;

const articles = JSON.parse(fs.readFileSync("articles.json").toString());

let html = "<html><head><meta charset='utf-8'><title>게시물 목록</title></head><body><table><tr><th>게시물 번호</th><th>제목</th><th>작성자</th><th>조회수</th></tr>"
for(let i = 0; i<articles.length; i++){
    html += "<tr>";
    html += "<td>"+(articles.length-i)+"</td>"
    html += "<td><a href='/cgi/read.js?num="+i+"'>"+articles[i].subject+"</a></td>"
    html += "<td>"+articles[i].writer+"</td>"
    html += "<td>"+articles[i].hitcount+"</td>"
    html += "</tr>";
}
html += "</table><a href='/write.html'>글쓰기</a></body></html><script>";
html += `this.unit = 5; // pagination에 뿌려지는 페이지 개수
const startPage = parseInt((this.curPage - 1) / this.unit) * this.unit + 1;
let endPage = startPage + this.unit - 1;
if(endPage > this.totalPage) endPage = this.totalPage;
this.pageList = \`\`;
for (let i = startPage; i <= endPage; i++) {
    this.pageList += \`<li class="pagination-item">
                         <a href="?p=${i}&sort=${window.sort}">${i}</a>
                    </li>\`;
}</script>`;
const buf = Buffer.from(html);
console.log("Content-Type: text/html");
console.log("Content-length: " + buf.length);
process.stdout.write(Buffer.from("\r\n"));
process.stdout.write(buf);
process.stdout.write(Buffer.from("\r\n"));