// Require.JS build profile
({
	appDir: "src",
	dir: "dist",
	baseUrl: "..",
	paths: {
		'jBinary': '../jBinary/src/jBinary',
		'jDataView': '../jDataView/src/jDataView',
		'jBinary.Repo': 'src/jBinary.Repo'
	},
	name: 'jBinary.Repo',
	fileExclusionRegExp: /^\.jshintrc$/
})