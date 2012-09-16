Utils = {};

Utils.getRandomColor = function () {
	var r = Crafty.math.randomInt(0, 255);
	var g = Crafty.math.randomInt(0, 255);
	var b = Crafty.math.randomInt(0, 255);
	var decColor = r + 256 * g + 65536 * b;
    return "#"+decColor.toString(16);
}