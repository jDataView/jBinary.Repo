define(['require', 'module', 'jbinary'], function (require, module, jBinary) {
	'use strict';

	var Repo = jBinary.Repo = function (names, callback) {
		names = names instanceof Array ? names.slice() : [names];

		for (var i = 0, length = names.length; i < length; i++) {
			var name = names[i];
			if (name.indexOf('/') < 0) {
				names[i] = 'jbinary.repo!' + name;
			}
		}

		require(names, function () {
			callback.apply(Repo, arguments);
		});
	};

	Repo.normalize = function (name) {
		return name.toUpperCase();
	};

	Repo.load = function (name, require, onLoad) {
		if (name in Repo) {
			return onLoad(Repo[name]);
		}

		var url = 'jbinary.repo.typeSets/' + name.toLowerCase();

		return require([url], function (typeSet) {
			onLoad(Repo[name] = typeSet);
		});
	};

	define('jbinary.repo.typeSets/associations?built', ['jbinary.repo.typeSets/associations'], function (descriptors) {
		var associations = {
			list: []
		};

		function mergeDescriptorList(name, listName) {
			var list = descriptors[name][listName];
			if (list) {
				associations[listName] = associations[listName] || {};
				for (var i = 0, length = list.length; i < length; i++) {
					associations[listName][list[i]] = name;
				}
			}
		}

		for (var name in descriptors) {
			associations.list.push(name);
			mergeDescriptorList(name, 'extensions');
			mergeDescriptorList(name, 'mimeTypes');
		}

		return associations;
	});

	Repo.getAssociations = function (callback) {
		require(['jbinary.repo.typeSets/associations?built'], function (associations) {
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
			if (source.type) {
				if (callback(associations.mimeTypes[source.type])) {
					return;
				}
			}
			
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

			_callback();
		});
	};

	jBinary.load.getTypeSet = function (source, typeSet, callback) {
		switch (typeof typeSet) {
			case 'undefined':
				var srcInfo;

				if (typeof Blob !== 'undefined' && source instanceof Blob) {
					srcInfo = source;
				} else
				if (typeof source === 'string') {
					var dataParts = source.match(/^data:(.+?)(;base64)?,/);
					srcInfo = dataParts ? {type: dataParts[1]} : {name: source};
				}

				if (srcInfo) {
					Repo.getAssociation(srcInfo, callback);
				} else {
					callback(typeSet);
				}

				break;

			case 'string':
				Repo(typeSet, callback);
				break;

			default:
				callback(typeSet);
				break;
		}
	};

	return Repo;
});