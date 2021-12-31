const fs = require('fs');

const getParameter = {};
if(process.env["QUERY_STRING"]){
    process.env["QUERY_STRING"].split("&").forEach(data=>{
        getParameter[data.split("=")[0]] = decodeURIComponent(data.split("=")[1].replace(/\+/g," "));
    })
}

const postParameter = {};
process.stdin.on("data",buf=>{
    if(process.env["Content-Type"].startsWith("multipart/form-data")){
        const boundary = process.env["Content-type"].split("boundary=")[1];
        buf = buf.toString();
        buf.split("--"+boundary);
    }else{
        buf.toString().split("&").forEach(data=>{
            postParameter[data.split("=")[0]] = decodeURIComponent(data.split("=")[1].replace(/\+/g," "));
        })
    }

    const articles = JSON.parse(fs.readFileSync("articles.json").toString());
    articles.unshift({subject:postParameter.subject, writer:postParameter.writer, content:postParameter.content, hitcount:0});
    fs.writeFileSync("articles.json",Buffer.from(JSON.stringify(articles)));

    let html = "<html><head><script>location.href='/cgi/list.js';</script></head></html>";
    const response = Buffer.from(html);
    console.log("Content-Type: text/html");
    console.log("Content-length: " + response.length);
    process.stdout.write(Buffer.from("\r\n"));
    process.stdout.write(response);
    process.stdout.write(Buffer.from("\r\n"));
})
