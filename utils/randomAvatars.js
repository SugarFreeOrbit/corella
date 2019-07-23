const jdeticon = require('jdenticon');
const fs = require('fs');

const generate = function (stringSeed, size=200) {
	return jdeticon.toPng(stringSeed, size);
};