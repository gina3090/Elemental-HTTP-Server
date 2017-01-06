// jshint esversion: 6

const http = require('http');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const qs = require('querystring');

const sendContent = (res, content) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(content);
  res.end();
};

const resourceMapping = {
  '/helium': './public/helium.html',
  '/hydrogen': './public/hydrogen.html',
  '/index': './public/index.html',
};

const server = http.createServer( (req, res) => {
  console.log('req.method', req.method);
  console.log('req.url', req.url);
  console.log('req.headers', req.headers);

  if(req.method === 'GET') {

    fs.readFile(resourceMapping[req.url] || '', (err, content) => {
      if(err) {
        res.statusCode = 404;
        sendContent(res, "Resource not found");
        return;
      }
      sendContent(res, content);
    });

  } else if(req.method === 'POST') {
    let reqBody = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
    reqBody += chunk;
    });

    req.on('end', () => {
    let bodyQS = qs.parse(reqBody);
    let htmlFile = `./public/${bodyQS.elementName}.html`;
    let htmlData = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${bodyQS.elementName}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${bodyQS.elementName}</h1>
  <h2>${bodyQS.elementSymbol}</h2>
  <h3>Atomic number ${bodyQS.elementAtomicNumber}</h3>
  <p>${bodyQS.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`;

      fs.writeFile(htmlFile, htmlData, (err) => {
        if(err) {
          res.statusCode = 404;
          sendContent(res, "Resource not found");
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({"success" : true});
        res.write();
        res.end();
      });

    });
  }
});

server.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});