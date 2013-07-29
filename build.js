// Require.JS build profile
({
	appDir: "src",
	dir: "dist",
	baseUrl: "..",
	paths: {
		'jbinary': '../jBinary/src/jbinary',
		'jdataview': '../jDataView/src/jdataview',
		'jbinary.repo': 'src/jbinary.repo'
	},
	name: 'jbinary.repo',
	fileExclusionRegExp: /^\.jshintrc$/
})