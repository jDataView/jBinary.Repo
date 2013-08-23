require.config({
	paths: {
		jsdeflate: '//raw.github.com/dankogai/js-deflate/master'
	},
	shim: {
		'jsdeflate/rawinflate': {
			exports: 'RawDeflate.inflate'
		},
		'jsdeflate/rawdeflate': {
			exports: 'RawDeflate.deflate'
		}
	}
});

define(['jbinary', 'jsdeflate/rawinflate', 'jsdeflate/rawdeflate'], function (jBinary, inflate, deflate) {
	return {
		'jBinary.all': 'File',
		'jBinary.littleEndian': true,
		'jBinary.mimeType': 'application/x-gzip',

		Flag: jBinary.Template({
			baseType: 1,
			params: ['fieldName'],
			write: function (context) {
				this.baseWrite(this.fieldName in context ? 1 : 0);
			}
		}),

		FlagDependency: jBinary.Template({
			params: ['flagName', 'baseType'],
			read: function (context) {
				if (context[this.flagName]) {
					return this.baseRead();
				}
			}
		}),

		CompressedData: jBinary.Template({
			baseType: 'string',
			read: function () {
				return new jBinary(inflate(this.baseRead()));
			},
			write: function (binary) {
				this.baseWrite(deflate(binary.read('string')));
			}
		}),

		File: {
			_id1: ['const', 'uint8', 0x1F, true],
			_id2: ['const', 'uint8', 0x8B, true],
			compression: ['enum', 'uint8', {8: 'Deflate'}],
			_reserved: ['const', 3, 0],
			_hasComment: ['Flag', 'comment'],
			_hasName: ['Flag', 'name'],
			_hasExtra: ['Flag', 'extra'],
			_hasHeaderCRC: ['Flag', 'headerCRC'],
			isText: 1,
			mod_time: jBinary.Template({
				baseType: 'uint32',
				read: function () {
					return new Date(this.baseRead() * 1000);
				},
				write: function (dateTime) {
					this.baseWrite(dateTime / 1000);
				}
			}),
			extraFlags: 'uint8',
			os: ['enum', 'uint8', [
				'FAT',
				'Amiga',
				'VMS',
				'Unix',
				'VM_CMS',
				'Atari_TOS',
				'HPFS',
				'Macintosh',
				'Z_System',
				'CP_M',
				'TOPS_20',
				'NTFS',
				'QDOS',
				'Acorn_RISCOS'
			]],
			extra: ['FlagDependency', '_hasExtra', jBinary.Template({
				baseType: {
					length: 'uint8',
					data: ['blob', 'length']
				},
				read: function () {
					return this.baseRead().data;
				},
				write: function (data) {
					this.baseWrite({
						length: data.length,
						data: data
					});
				}
			})],
			name: ['FlagDependency', '_hasName', 'string0'],
			comment: ['FlagDependency', '_hasComment', 'string0'],
			headerCRC: ['FlagDependency', '_hasHeaderCRC', 'uint16'],
			content: ['lazy', 'CompressedData', function () { return this.binary.view.byteLength - 8 - this.binary.tell() }],
			crc32: 'uint32',
			input_size: 'uint32'
		}
	};
});