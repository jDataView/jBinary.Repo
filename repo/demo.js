require.config({
	paths: {
		'jdataview': [
			'../../jDataView/src/jdataview',
			'//rawgithub.com/jDataView/jDataView/master/src/jdataview'
		],
		'jbinary': [
			'../../jBinary/src/jbinary',
			'//rawgithub.com/jDataView/jBinary/master/src/jbinary'
		],
		'jbinary.repo': [
			'../src/jbinary.repo',
			'//rawgithub.com/jDataView/jBinary.Repo/master/src/jbinary.repo'
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
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
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
					template: url
				})
			}, function () {});
		}
	};
	ko.virtualElements.allowedBindings.partial = true;

	var viewModel = {
		type: ko.observable(''),
		files: ko.observable([]),
		binary: ko.observable(null)
	};

	viewModel.data = ko.computed(function () {
		var binary = viewModel.binary();
		return binary ? binary.read('jBinary.all') : {};
	});

	viewModel.object2array = function (object) {
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
		var binary = viewModel.binary;
		binary(null);
		require(['jbinary', 'jbinary.repo'], function (jBinary) {
			jBinary.load(source, viewModel.type(), function (err, _binary) {
				if (err) return alert(err);
				binary(_binary);
			});
		});
	};

	viewModel.loadFromLink = function (viewModel, event) {
		var target = event.target || event.srcElement;
		if (target.tagName === 'A') {
			viewModel.loadData(target.href);
		}
	};

	viewModel.loadFromFile = function () {
		var target = event.target || event.srcElement;
		viewModel.loadData(target.files[0]);
	};

	require(['domReady!'], function () {
		if (!('head' in document)) {
			document.head = document.getElementsByTagName('head')[0];
		}

		ko.applyBindings(viewModel);
	});

	return viewModel;
});