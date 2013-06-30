jBinary.Repo.ICO = {
	RGBTriple: {
		b: 'uint8',
		g: 'uint8',
		r: 'uint8'
	},

	RGBQuad: ['extend', 'RGBTriple', {
		_: ['skip', 1]
	}],

	// if image dimensions is zero, it means to be 256
	ImageDimension: jBinary.Template({
		baseType: 'uint8',
		read: function () {
			return this.baseRead() || 256;
		},
		write: function (value) {
			this.baseWrite(value < 256 ? value : 0);
		}
	}),

	// helper for dynamic array size calculation
	ArraySize: jBinary.Template({
		params: ['baseType', 'array'],
		write: function (context) {
			this.baseWrite(context[this.array].length);
		}
	}),

	IconDirEntry: {
		width: 'ImageDimension',
		height: 'ImageDimension',
		colorsCount: 'uint8',
		_reserved: ['skip', 1],
		planesCount: 'uint16',
		bpp: 'uint16',
		dataSize: 'uint32',
		dataOffset: 'uint32'
	},

	IconDir: jBinary.Template({
		baseType: {
			_reserved: ['skip', 2],
			_type: ['const', 'uint16', 1, true],
			_imageCount: ['ArraySize', 'uint16', 'images'],
			images: ['array', 'IconDirEntry', '_imageCount']
		},
		read: function () {
			return this.baseRead().images;
		},
		write: function (images) {
			this.baseWrite({
				_imageCount: images.length,
				images: images
			});
		}
	}),

	Dimensions: {
		horz: 'uint32',
		vert: 'uint32'
	},

	ImageHeader: {
		// Dimensions of DIB header
		dibHeaderSize: 'uint32',
		// image dimensions
		size: 'Dimensions',
		// color planes count (equals 1)
		planesCount: 'uint16',
		// color depth (bits per pixel)
		bpp: 'uint16',
		// compression type
		compression: 'uint32',
		// Dimensions of bitmap data
		dataSize: 'uint32',
		// resolutions (pixels per meter)
		resolution: 'Dimensions',
		// total color count
		colorsCount: jBinary.Template({
			baseType: 'uint32',
			read: function (context) {
				return this.baseRead() || Math.pow(2, context.bpp); /* (1 << bpp) not applicable for 32bpp */
			}
		}),
		// count of colors that are required for displaying image
		importantColorsCount: jBinary.Template({
			baseType: 'uint32',
			read: function (context) {
				return this.baseRead() || context.baseType;
			}
		}),
		palette: ['if', function (context) { return context.bpp <= 8 }, ['array', 'RGBQuad', 'colorsCount']]
	},
};