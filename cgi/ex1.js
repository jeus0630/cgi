// CGI 프로그램 예제

const getParameter = {};
if(process.env["QUERY_STRING"]){
    process.env["QUERY_STRING"].split("&").forEach(data=>{
        getParameter[data.split("=")[0]] = decodeURIComponent(data.split("=")[1].replace(/\+/g," "));
    })
}

let html = "<html><head><meta charset='utf-8'><title>CGI 테스트</title></head><body><h1>안녕하세요? CGI 입니다</h1>"
    for(let key in getParameter){
        html += "<p>"+key+": "+getParameter[key]+"</p>";
    }
html += "</body></html>";
    const buf = Buffer.from(html);
console.log("Content-Type: text/html");
console.log("Content-length: " + buf.length);
process.stdout.write(Buffer.from("\r\n"));
process.stdout.write(buf);
process.stdout.write(Buffer.from("\r\n"));
