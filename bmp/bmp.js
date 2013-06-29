jBinary.Repo.BMP = {
	bgr: {
		b: 'uint8',
		g: 'uint8',
		r: 'uint8'
	},
	bgra: ['extend', 'bgr', {
		a: 'uint8'
	}],
	size: {
		horz: 'uint32',
		vert: 'uint32'
	},
	header: {
		// bitmap "magic" signature
		_signature: ['const', ['string', 2], 'BM', true],
		// full file size
		fileSize: 'uint32',
		// reserved
		reserved: 'uint32',
		// offset of bitmap data
		dataOffset: 'uint32',
		// size of DIB header
		dibHeaderSize: 'uint32',
		// image dimensions
		size: 'size',
		// color planes count (equals 1)
		planesCount: 'uint16',
		// color depth (bits per pixel)
		bpp: 'uint16',
		// compression type
		compression: 'uint32',
		// size of bitmap data
		dataSize: 'uint32',
		// resolutions (pixels per meter)
		resolution: 'size',
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
		// color palette (mandatory for <=8bpp images)
		palette: ['if', function (context) { return context.bpp <= 8 }, ['array', ['extend', 'bgr', {_padding: ['skip', 1]}], 'colorsCount']],
		// color masks (needed for 16bpp images)
		mask: {
			r: 'uint32',
			g: 'uint32',
			b: 'uint32'
		}
	}
};