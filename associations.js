define(function () {

var descriptors = {
	bmp: {
		extensions: ['bmp'],
		mimeTypes: ['image/bmp', 'image/x-bmp', 'image/x-bitmap', 'image/x-xbitmap', 'image/x-win-bitmap', 'image/x-windows-bmp', 'image/ms-bmp', 'image/x-ms-bmp', 'application/bmp', 'application/x-bmp', 'application/x-win-bitmap']
	},
	gzip: {
		extensions: ['gz', 'tgz'],
		mimeTypes: ['application/gzip', 'application/x-gzip', 'application/x-gunzip', 'application/gzipped', 'application/gzip-compressed', 'gzip/document']
	},
	ico: {
		extensions: ['ico'],
		mimeTypes: ['image/ico', 'image/x-icon', 'application/ico', 'application/x-ico']
	},
	mp3: {
		extensions: ['mp3'],
		mimeTypes: ['audio/mpeg', 'audio/x-mpeg', 'audio/mp3', 'audio/x-mp3', 'audio/mpeg3', 'audio/x-mpeg3', 'audio/mpg', 'audio/x-mpg', 'audio/x-mpegaudio']
	},
	tar: {
		extensions: ['tar'],
		mimeTypes: ['application/tar', 'application/x-tar', 'applicaton/x-gtar', 'multipart/x-tar']
	}
};

var associations = {
	extensions: {},
	mimeTypes: {}
};

function mergeDescriptorList(name, listName) {
	var list = descriptors[name][listName];
	if (list) {
		for (var i = 0, length = list.length; i < length; i++) {
			associations[listName][list[i]] = name;
		}
	}
}

for (var name in descriptors) {
	mergeDescriptorList(name, 'extensions');
	mergeDescriptorList(name, 'mimeTypes');
}

return associations;

});