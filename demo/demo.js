require.config({
	paths: {
		'jdataview': [
			'../../jDataView/src/jdataview',
			'//raw.github.com/jDataView/jDataView/master/src/jdataview'
		],
		'jbinary': [
			'../../jBinary/src/jbinary',
			'//raw.github.com/jDataView/jBinary/master/src/jbinary'
		],
		'jbinary.repo': [
			'../src/jbinary.repo',
			'//raw.github.com/jDataView/jBinary.Repo/master/src/jbinary.repo'
		],
		'jbinary.repo.typeSets': 'jbinary.repo/../../typeSets',
		'domReady': '//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady',
		'text': '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.5/text',
		'knockout': '//cdnjs.cloudflare.com/ajax/libs/knockout/2.3.0/knockout-min'
	}
});

define(['require', 'knockout'], function (require, ko) {
	ko.bindingHandlers.download = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			function getInfo(propName) {
				return ko.unwrap(valueAccessor())[propName];
			}

			var blob;

			ko.applyBindingsToNode(element, {
				text: ko.computed(function () {
					return getInfo('label') || 'Download';
				}),
				attr: {
					href: '#',
					download: ko.computed(function () {
						return (getInfo('name') || '').replace(/.*\/(.*)$/, '$1');
					})
				},
				event: {
					click: function (viewModel, event) {
						if (!/#$/.test(element.href)) return true;

						var binary = getInfo('binary');

						// handy method, but only in IE10 as for now :(
						if ('msSaveOrOpenBlob' in navigator) {
							navigator.msSaveBlob((blob || (blob = new Blob([binary.read('blob', 0)]))), element.download);
						} else {
							element.href = binary.toURI();
							element.target = '_blank';
							return true;
						}
					}
				}
			});
		}
	};

	var viewModel = {
		associations: ko.observable({}),
		type: ko.observable(''),
		template: ko.observable({}),
		config: ko.observable({}),
		binary: ko.observable(null)
	};

	viewModel.data = ko.computed(function () {
		var binary = viewModel.binary();
		return binary ? binary.read('jBinary.all') : null;
	});

	viewModel.object2array = function (object) {
		if (object.length > 256) {
			var oldObject = object;
			object = {};
			for (var i = 0, length = oldObject.length; i < length; i += 256) {
				object[i + '-' + (i + 255)] = Array.prototype.slice.call(oldObject, i, i + 256);
			}
			for (var key in oldObject) {
				if (!(key >= 0 && key < oldObject.length)) {
					object[key] = oldObject[key];
				}
			}
		}

		var array = [];

		ko.utils.objectForEach(object, function (key, value) {
			if ((object.length > 256 && key >= 0 && key < object.length) || key.charAt(0) === '_') return;
			array.push({
				key: key,
				value: value
			});
		});

		return array;
	};

	viewModel.loadData = function (source) {
		require(['jbinary', 'jbinary.repo!' + viewModel.type()], function (jBinary, typeSet) {
			jBinary.load(source, typeSet, function (err, _binary) {
				if (err) return alert(err);
				viewModel.binary(_binary);
			});
		});
	};

	viewModel.loadFromLink = function (viewModel, event) {
		var target = event.target || event.srcElement;
		if (target.tagName === 'A') {
			viewModel.loadData(target.href);
		}
	};

	viewModel.loadFromFile = function (viewModel, event) {
		var target = event.target || event.srcElement;
		viewModel.loadData(target.files[0]);
	};

	var titleSuffix = document.title;

	ko.computed(function () {
		var type = viewModel.type();

		document.title = (type ? type.toUpperCase() + ' - ' : '') + titleSuffix;
		viewModel.binary(null);

		if (!type) return;

		viewModel.config({});
		require([type + '/demo'], viewModel.config);
	});

	require(['jbinary.repo'], function (Repo) {
		Repo.getAssociations(viewModel.associations);
	});

	require(['domReady!'], function () {
		if (!('head' in document)) {
			document.head = document.getElementsByTagName('head')[0];
		}

		ko.computed(function () {
			var type = viewModel.type();
			if (!type) return;

			viewModel.template({});

			var templateUrl = 'text!' + type + '/demo.html';

			require([templateUrl], function (html) {
				if (!document.getElementById(templateUrl)) {
					var script = document.createElement('script');
					script.id = templateUrl;
					script.type = 'text/html';
					script.text = html;
					document.head.appendChild(script);
				}
				viewModel.template(templateUrl);
			}, function () {});
		});

		ko.applyBindings(viewModel);
	});

	return viewModel;
});