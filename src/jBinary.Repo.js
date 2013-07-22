(function (define) {

'use strict';

define('jBinary.Repo', ['require', 'jBinary'], function (requirejs, jBinary) {

var rootUrl = 'https://rawgithub.com/jDataView/jBinary.Repo/gh-pages/';

var Repo = jBinary.Repo = function (names, callback) {
	if (!(names instanceof Array)) {
		names = [names];
	}

	var urls = names.map(function (name) {
		var lowerName = name.toLowerCase(), upperName = name.toUpperCase();
		var url = rootUrl + 'repo/' + lowerName + '/' + lowerName + '.js';
		if (upperName in jBinary.Repo) {
			define(url, jBinary.Repo[upperName]);
		}
		return url;
	});

	requirejs(urls, function () {
		for (var i = 0, length = arguments.length; i < length; i++) {
			Repo[names[i].toUpperCase()] = arguments[i];
		}
		callback.apply(Repo, arguments);
	});
};

Repo.getAssociations = function (callback) {
	// lazy loading data by replacing `jBinary.Repo.getAssociations` itself
	requirejs([rootUrl + 'associations.js'], function (associations) {
		callback.call(Repo, associations);
	});
};

Repo.getAssociation = function (source, _callback) {
	var callback = function (typeSetName) {
		if (typeSetName) {
			Repo(typeSetName, _callback);
			return true;
		} else {
			return false;
		}
	};

	Repo.getAssociations(function (associations) {
		if (source.name) {
			// extracting only longest extension part
			var longExtension = source.name.match(/^(.*\/)?.*?(\.|$)(.*)$/)[3].toLowerCase();

			if (longExtension) {
				var fileParts = longExtension.split('.');

				// trying everything from longest possible extension to shortest one
				for (var i = 0, length = fileParts.length; i < length; i++) {
					var extension = fileParts.slice(i).join('.');

					if (callback(associations.extensions[extension])) {
						return;
					}
				}
			}
		}

		if (source.type) {
			if (callback(associations.mimeTypes[source.type])) {
				return;
			}
		}

		_callback();
	});
};

jBinary.load = function (source, typeSet, callback) {
	function withTypeSet(typeSet) {
		jBinary.loadData(source, function (err, data) {
			err ? callback(err) : callback(null, new jBinary(data, typeSet));
		});
	}

	if (arguments.length < 3) {
		callback = arguments[1];
		var srcInfo;

		if (typeof Blob !== 'undefined' && source instanceof Blob) {
			srcInfo = source;
		} else
		if (typeof source === 'string') {
			var dataParts = source.match(/^data:(.+?)(;base64)?,/);
			srcInfo = dataParts ? {type: dataParts[1]} : {name: source};
		}

		if (srcInfo) {
			Repo.getAssociation(srcInfo, withTypeSet);
		} else {
			withTypeSet();
		}
	} else {
		typeof typeSet === 'string' ? Repo(typeSet, withTypeSet) : withTypeSet(typeSet);
	}
};

return Repo;

});

})(this.define || require('requirejs').define);