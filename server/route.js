const fs = require('fs');
const util = require('util');
const path = require('path');
const ejs = require('ejs');

const config = require('./config');
const mime = require('./mime');
const compress = require('./compress');
const isCache = require('./cache');

const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);

const tplPath = path.join(__dirname, '../src/template/index.ejs');
const source = fs.readFileSync(tplPath); // 读出来的是buffer

module.exports = async function (request, response, filePath) {
	try {
		const stats = await stat(filePath); // fs.stat() 读取文件状态信息
		if (stats.isFile()) {
			const mimeType = mime(filePath);
			response.setHeader('content-type', mimeType);

			if (isCache(stats, request, response)) {
				response.statusCode = 304;
				response.end();
				return;
			}

			response.statusCode = 200;

			let readStream = fs.createReadStream(filePath);
			// createReadStream 往往用于打开大型的文本文件，读取操作的缓存装不下，只能分成几次发送

			if (filePath.match(config.compress)) { // 正则匹配：/\.(html|js|css|md)/
				readStream = compress(readStream, request, response);
			}
			readStream.pipe(response); // pipe 分段读取文件到内存，优化高并发的情况。
		}
		else if (stats.isDirectory()) {
			const files = await readdir(filePath); // fs.readdir() 读取目录中的文件名
			response.statusCode = 200;
			response.setHeader('content-type', 'text/html;charset=UTF-8');

			const dir = path.relative(config.root, filePath); // relative 用两个绝对路径返回相对路径
			const data = {
				files,
				dir: dir ? `${dir}` : '', // path.relative可能返回空字符串
			}

			const template = ejs.render(source.toString(), data);
			// ejs.render(fs.readFileSync(path.join(__dirname, '../src/template/index.ejs')).toString(), data);

			response.end(template);
		}
	} catch (err) {
		console.log(err);
		response.statusCode = 404;
		response.setHeader('content-type', 'text/plain;charset=UTF-8');
		response.end(`${filePath} is not a file`);
	}
};
