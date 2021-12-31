const fs = require('fs');

const getParameter = {};
if(process.env["QUERY_STRING"]){
    process.env["QUERY_STRING"].split("&").forEach(data=>{
        getParameter[data.split("=")[0]] = decodeURIComponent(data.split("=")[1].replace(/\+/g," "));
    })
}

const articles = JSON.parse(fs.readFileSync("articles.json").toString());
const curPage = parseInt(getParameter.p || 1);
const length = ((curPage -1) * 10 + 10) > articles.length ? articles.length : ((curPage -1) * 10 + 10);
let html = "<html><head><meta charset='utf-8'><title>게시물 목록</title><style>.pagination{list-style: none;display: flex;}.pagination li{padding: 10px;} .pagination li a{text-decoration: none; color:#000;} .pagination li a.on{color:blue;}</style></head><body><table><tr><th>게시물 번호</th><th>제목</th><th>작성자</th><th>조회수</th></tr>"

for(let i = (curPage -1) * 10; i<length; i++){
    html += "<tr>";
    html += "<td>"+(articles.length-i)+"</td>"
    html += "<td><a href='/cgi/read.js?num="+i+"'>"+articles[i].subject+"</a></td>"
    html += "<td>"+articles[i].writer+"</td>"
    html += "<td>"+articles[i].hitcount+"</td>"
    html += "</tr>";
}
html += "</table><a href='/write.html'>글쓰기</a><ul class='pagination'>";

const unit = 5;
const startPage = parseInt((curPage -1) / unit) * unit + 1;
let endPage = startPage + unit - 1;
const totalPage = parseInt(articles.length/10) < 1 ? 1 : articles.length % 10 !== 0 ? parseInt(articles.length/10) + 1 : parseInt(articles.length/10);
if(endPage > totalPage) endPage = totalPage;

const curRemainder = curPage % 5;
let prev = curPage > 5 ? (curRemainder == 0 ? curPage - 5 : curPage - curRemainder ): 1;
let next = curRemainder == 0 ? (curPage + 1 <= totalPage ? curPage+1 : curPage) : (curPage + (unit + 1 - curRemainder) <= totalPage ? curPage + (unit + 1 - curRemainder) : totalPage);

let pageList = `<li><a href="?p=${prev}">&lt;</a></li>`;
for(let i = startPage; i <= endPage; i++){
    pageList += `<li><a href="?p=${i}" class="num">${i}</a></li>`;
}

pageList += `<li><a href="?p=${next}">&gt;</a></li>`

html += pageList;

html += `</ul><script>
Array.from(document.querySelectorAll('.pagination li a.num')).forEach(el=>{
    const [etc, p] = el.href.split('p=');
    if(p == ${curPage}) el.classList.add('on');
})

</script></body></html>`;

const buf = Buffer.from(html);
console.log("Content-Type: text/html");
console.log("Content-length: " + buf.length);
process.stdout.write(Buffer.from("\r\n"));
process.stdout.write(buf);
process.stdout.write(Buffer.from("\r\n"));