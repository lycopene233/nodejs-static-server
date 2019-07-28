const config = require('./config');

function refreshRes(stats, response) {
	const {
		maxAge,
		expires,
		cacheControl,
		lastModified,
		etag
	} = config.cache;

	if (expires) {
		response.setHeader('Expires', (new Date(Date.now() + maxAge * 1000)).toUTCString());
	}
	if (cacheControl) {
		response.setHeader('Cache-Control', `public, max-age=${maxAge}`);
	}
	if (lastModified) {
		response.setHeader('Last-Modified', stats.mtime.toUTCString()); // stats.mtime 上次修改此文件的时间戳
	}
	if (etag) {
		response.setHeader('Etag', `${stats.size}-${stats.mtime.toUTCString()}`);
		// mtime 需要转成字符串，否则在 windows 环境下会报错
	}
}

module.exports = function isCache (stas, request, response) {
	refreshRes(stas, response);

	const lastModified = request.headers['if-modified-since'];
	const etag = request.headers['if-none-match'];

	if (! lastModified && ! etag) {
		return false;
	}
	if (lastModified && lastModified !== response.getHeader('Last-Modified')) {
		return false;
	}
	if (etag && etag !== response.getHeader('Etag')) {
		// return false;
	}

	return true;
};
