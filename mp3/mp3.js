(jBinary.Repo || (jBinary.Repo = {})).MP3 = {
	MetaValue: ['string0', 30],

	ID3v1: ['extend',
		{
			_skip: ['skip', function () { return this.binary.view.byteLength - 128 }],
			_header: ['const', ['string', 3], 'TAG'],
			title: 'MetaValue',
			artist: 'MetaValue',
			album: 'MetaValue',
			year: ['string', 4],
			comment: 'MetaValue'
		},
		['if_not', function (context) { console.log(context.comment); return context.comment.length > 28 }, {
			_back: ['skip', -2],
			_zero_byte: ['const', 'uint8', 0, true],
			track: 'uint8',
		}],
		{
			genre: ['enum', 'uint8', [
				'Blues',
				'Classic Rock',
				'Country',
				'Dance',
				'Disco',
				'Funk',
				'Grunge',
				'Hip-Hop',
				'Jazz',
				'Metal',
				'New Age',
				'Oldies',
				'Other',
				'Pop',
				'R&B',
				'Rap',
				'Reggae',
				'Rock',
				'Techno',
				'Industrial',
				'Alternative',
				'Ska',
				'Death Metal',
				'Pranks',
				'Soundtrack',
				'Euro-Techno',
				'Ambient',
				'Trip-Hop',
				'Vocal',
				'Jazz+Funk',
				'Fusion',
				'Trance',
				'Classical',
				'Instrumental',
				'Acid',
				'House',
				'Game',
				'Sound Clip',
				'Gospel',
				'Noise',
				'Alternative Rock',
				'Bass',
				'Soul',
				'Punk',
				'Space',
				'Meditative',
				'Instrumental Pop',
				'Instrumental Rock',
				'Ethnic',
				'Gothic',
				'Darkwave',
				'Techno-Industrial',
				'Electronic',
				'Pop-Folk',
				'Eurodance',
				'Dream',
				'Southern Rock',
				'Comedy',
				'Cult',
				'Gangsta',
				'Top 40',
				'Christian Rap',
				'Pop/Funk',
				'Jungle',
				'Native US',
				'Cabaret',
				'New Wave',
				'Psychadelic',
				'Rave',
				'Showtunes',
				'Trailer',
				'Lo-Fi',
				'Tribal',
				'Acid Punk',
				'Acid Jazz',
				'Polka',
				'Retro',
				'Musical',
				'Rock & Roll',
				'Hard Rock',
				'Folk',
				'Folk-Rock',
				'National Folk',
				'Swing',
				'Fast Fusion',
				'Bebob',
				'Latin',
				'Revival',
				'Celtic',
				'Bluegrass',
				'Avantgarde',
				'Gothic Rock',
				'Progressive Rock',
				'Psychedelic Rock',
				'Symphonic Rock',
				'Slow Rock',
				'Big Band',
				'Chorus',
				'Easy Listening',
				'Acoustic',
				'Humour',
				'Speech',
				'Chanson',
				'Opera',
				'Chamber Music',
				'Sonata',
				'Symphony',
				'Booty Bass',
				'Primus',
				'Porn Groove',
				'Satire',
				'Slow Jam',
				'Club',
				'Tango',
				'Samba',
				'Folklore',
				'Ballad',
				'Power Ballad',
				'Rhythmic Soul',
				'Freestyle',
				'Duet',
				'Punk Rock',
				'Drum Solo',
				'Acapella',
				'Euro-House',
				'Dance Hall',
				'Goa',
				'Drum & Bass',
				'Club - House',
				'Hardcore',
				'Terror',
				'Indie',
				'BritPop',
				'Negerpunk',
				'Polsk Punk',
				'Beat',
				'Christian Gangsta Rap',
				'Heavy Metal',
				'Black Metal',
				'Crossover',
				'Contemporary Christian',
				'Christian Rock',
				'Merengue',
				'Salsa',
				'Thrash Metal',
				'Anime',
				'JPop',
				'Synthpop'
			]]
		}
	]
};