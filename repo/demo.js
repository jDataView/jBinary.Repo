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
		'domReady': '//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady',
		'text': '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.5/text',
		'knockout': '//cdnjs.cloudflare.com/ajax/libs/knockout/2.3.0/knockout-min'
	},
	config: {
		'jbinary.repo': {
			repo: './'
		}
	}
});

define(['require', 'knockout'], function (require, ko) {
	ko.bindingHandlers.partial = {
		init: function () {
			return {controlsDescendantBindings: true};
		},
		update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var url = ko.unwrap(valueAccessor());

			if (!url) return;

			var id = 'text!' + url;

			if (!document.getElementById(id)) {
				var script = document.createElement('script');
				script.id = id;
				script.type = 'text/html';
				document.head.appendChild(script);
				require([id], function (text) {
					script.text = text;
				});
			}
			
			require([id], function () {
				ko.applyBindingsToNode(element, {
					template: {
						name: id,
						data: bindingContext.$data
					}
				}, bindingContext.$root);
			}, function () {});
		}
	};
	ko.virtualElements.allowedBindings.partial = true;

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
		type: ko.observable(''),
		isTypeResolved: ko.observable(false),
		files: ko.observable([]),
		binary: ko.observable(null)
	};

	viewModel.data = ko.computed(function () {
		var binary = viewModel.binary();
		return binary ? binary.read('jBinary.all') : {};
	});

	viewModel.object2array = function (object) {
		if (object instanceof Function) return [];

		var array = [];

		ko.utils.objectForEach(ko.unwrap(object), function (key, value) {
			if (key > 16 || key.charAt(0) === '_') return;
			array.push({
				key: key,
				value: key == 16 ? '...' : value
			});
		});

		return array;
	};

	viewModel.loadData = function (source) {
		viewModel.binary(null);
		viewModel.isTypeResolved(false);
		require(['jbinary', 'jbinary.repo!' + viewModel.type()], function (jBinary, typeSet) {
			viewModel.isTypeResolved(true);
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

	require(['domReady!'], function () {
		if (!('head' in document)) {
			document.head = document.getElementsByTagName('head')[0];
		}

		ko.applyBindings(viewModel);
	});

	require(['text', 'jbinary.repo']); // prefetch

	return viewModel;
});