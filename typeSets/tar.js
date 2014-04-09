define(['jbinary'], function (jBinary) {
	return {
		'jBinary.all': 'File',
		'jBinary.mimeType': 'application/x-tar',

		OctValue: jBinary.Template({
			params: ['size'],
			setParams: function (size) {
				this.baseType = ['string0', size];
			},
			read: function () {
				return parseInt(this.baseRead(), 8);
			},
			write: function (value) {
				value = value.toString(8);
				value = Array(this.size - value.length).join('0') + value;
				this.baseWrite(value);
			}
		}),

		Oct6: ['OctValue', 6],
		Oct8: ['OctValue', 8],
		Oct12: ['OctValue', 12],

		Padding: ['skip', function () {
			return (512 - (this.binary.tell() % 512)) % 512;
		}],

		Checksum: jBinary.Template({
			baseType: {
				value: 'Oct6',
				_after: ['const', ['string', 2], '\x00 ', true]
			},
			read: function () {
				return this.baseRead().value;
			},
			write: function (value) {
				this.baseWrite({
					value: value
				});
			}
		}),

		FileItem: ['extend',
		{
			_startPos: function () { return this.binary.tell() },
			name: ['string0', 100],
			mode: 'Oct8',
			owner: 'Oct8',
			group: 'Oct8',
			size: jBinary.Template({
				baseType: 'Oct12',
				write: function (_, context) {
					this.baseWrite(context.content.view.byteLength);
				}
			}),
			modTime: jBinary.Template({
				baseType: 'Oct12',
				read: function () {
					return new Date(this.baseRead() * 1000);
				},
				write: function (dateTime) {
					this.baseWrite(dateTime / 1000);
				}
			}),
			_checksumPos: function () { return this.binary.tell() },
			_checksum: jBinary.Template({
				baseType: 'Checksum',
				write: function () {
					this.binary.skip(8); // will be set to real checksum later
				}
			}),
			type: ['enum', 'char', [
				'file',
				'hard',
				'symbolic',
				'device_char',
				'device_block',
				'directory',
				'pipe',
				'contiguous'
			]],
			nameLinked: ['string0', 100],
			_ustar: ['const', ['string', 8], 'ustar\x0000']
		},
		['if', function (context) { return context._ustar === undefined || context._ustar === 'ustar\x0000' }, {
			ownerName: ['string0', 32],
			groupName: ['string0', 32],
			device: ['array', 'Oct8', 2],
			namePrefix: ['string0', 155]
		}],
		{
			_padding1: 'Padding',
			_realChecksum: function () {
				var context = this.binary.getContext(1),
					startPos = context._startPos,
					length = this.binary.tell() - startPos,
					bytes = this.binary.read(['blob', length], startPos),
					checksum = 0;

				for (var i = 0, length = bytes.length; i < length; i++) {
					checksum += bytes[i];
				}

				for (var i = 0; i <= 6; i++) {
					checksum += -bytes[context._checksumPos + i] + 32;
				}

				return checksum;
			},
			hasValidChecksum: jBinary.Type({
				read: function (context) {
					return this.binary.getContext(1)._checksum === context._realChecksum;
				},
				write: function (_, context) {
					this.binary.write('Checksum', context._realChecksum, this.binary.getContext(1)._checksumPos);
				}
			}),
			content: ['binary', function () { return this.binary.getContext(1).size }],
			_padding2: 'Padding'
		}
		],

		File: jBinary.Template({
			baseType: ['array', 'FileItem'],
			read: function () {
				var items = [], view = this.binary.view, item;
				while (view.tell() < view.byteLength && !isNaN((item = this.binary.read('FileItem')).size)) {
					items.push(item);
				}
				return items;
			}
		})
	};
});
