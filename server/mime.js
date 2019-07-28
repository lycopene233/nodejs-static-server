const path = require('path');

const mimeTypes = {
	'js': 'application/x-javascript; charset=UTF-8',
	'html': 'text/html; charset=UTF-8',
	'css': 'text/css; charset=UTF-8',
	'txt': 'text/plain; charset=UTF-8',
}

module.exports = (filePath) => {
	let ext = path.extname(filePath) // fs.extname(filePath) -> '.js'
		.split('.').pop().toLowerCase()

	if (!ext) ext = filePath; // 如果没有扩展名，例如是文件

	return mimeTypes[ext] || mimeTypes['txt']; 
}
