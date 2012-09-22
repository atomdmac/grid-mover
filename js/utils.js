Utils = {};

/**
 * Generate a random color in hex form.
 *
 * Thanks to Soubok from Stack Overflow for this function.
 * Source: http://stackoverflow.com/questions/1152024/best-way-to-generate-a-random-color-in-javascript#1152508
 */
Utils.getRandomColor = function () {
	 return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
}

/**
 * Generate a String to serve as a unique identifier.
 */
Utils.generateId = function () {
	return new Date().getTime();
}

/**
 * Generate a random integer between the given minimun and maximum values.
 */
Utils.getRandomInt = function (min, max) {
	return Math.round(((max - min) * Math.random()) + min);
}

/**
 * Convert the given number to a string with the appropriate number of leading
 * 0's.
 *
 * Thanks to Peter Bailey from Stack Overflow for this function.
 * Source: http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
 */
Utils.padZeros = function ( number, width ) {
	width -= number.toString().length;
	if ( width > 0 ) {
		return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	}
	return number + ""; // always return a string
}

Utils.bindScope = function (scope, func) {
	return function () {
		func.apply(scope, arguments);
	}
}