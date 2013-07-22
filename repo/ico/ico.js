define(['jBinary'], function (jBinary) {
	return {
		'jBinary.littleEndian': true,
		'jBinary.mimeType': 'image/x-icon',

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

		PixelRow: jBinary.Template({
			palette: null,

			setParams: function (header) {
				var itemType;

				switch (header.bpp) {
					case 1:
					case 2:
					case 4:
						this.palette = header.palette;
						itemType = header.bpp;
						break;

					case 8:
						this.palette = header.palette;
						itemType = 'uint8';
						break;

					case 16:
						itemType = jBinary.Template({
							baseType: 'uint16',
							mask: header.mask,
							read: function () {
								var colorIndex = this.baseRead();
								return {
									b: (colorIndex & this.mask.b) << 3,
									g: (colorIndex & this.mask.g) >> 3,
									r: (colorIndex & this.mask.r) >> 8
								};
							}
						});
						break;

					case 24:
						itemType = 'RGBTriple';
						break;

					case 32:
						itemType = 'RGBQuad';
						break;

					default:
						throw new TypeError('Sorry, but ' + header.bpp + 'bpp images are not supported.');
				}

				this.baseType = ['array', itemType, header.size.horz];
				this.dataOffset = header.dataOffset;
			},

			read: function () {
				var colors = this.baseRead();
				if (this.palette !== null) {
					for (var i = 0, length = colors.length; i < length; i++) {
						colors[i] = this.palette[colors[i]];
					}
				}

				// padding new row's alignment to 4 bytes
				var offsetOverhead = (this.binary.tell() - this.dataOffset) % 4;
				if (offsetOverhead) {
					this.binary.skip(4 - offsetOverhead);
					this.binary._bitShift = 0;
				}

				return colors;
			}
		}),

		IconImage: {
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
			palette: ['if', function (context) { return context.bpp <= 8 }, ['array', 'RGBQuad', 'colorsCount']],
			pixelData: jBinary.Type({
				read: function (header) {
					var width = header.size.horz, height = header.size.vert / 2;
					var data = new jDataView(4 * width * height);
					var PixelRow = this.binary.getType(['PixelRow', header]);
					for (var y = height - 1; y > 0; y--) {
						data.seek(4 * y * width);
						var colors = this.binary.read(PixelRow);
						for (var i = 0, length = colors.length; i < length; i++) {
							var color = colors[i];
							data.writeBytes([color.r, color.g, color.b, 'a' in color ? color.a : 255]);
						}
					}
					return data.getBytes(undefined, 0);
				}
			})
		},
	};
});