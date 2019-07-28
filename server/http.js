const http = require('http');
const path = require('path');

const config = require('./config');
const route = require('./route');

const server = http.createServer((request, response) => {
	let filePath = decodeURI(path.join(config.root, request.url)); // 不decode无法识别汉字……
	route(request, response, filePath);
});

server.listen(config.port, config.host, () => {
	const addr = `http://${config.host}:${config.port}`;
	console.log(`server started at ${addr}`);
});
