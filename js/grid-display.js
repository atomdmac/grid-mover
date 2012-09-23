// ----------------------------------------------------------------- //
// Grid Display
// ----------------------------------------------------------------- //
Crafty.c("GridDisplay", {
	_tileW: 50,
	_tileH: 50,
	_drawGrid: function (size) {
		var stage = $(Crafty.stage.elem);
		var xtotal = stage.outerWidth();
		var ytotal = stage.outerHeight();
		var xcells = xtotal / this._tileW;
		var ycells = ytotal / this._tileH;
		var ctx = this.ctx;
		ctx.stokeStyle = "#000";
		for (var x=0; x<xcells; x++) {
			ctx.moveTo(x*this._tileW, 0);
			ctx.lineTo(x*this._tileW, ytotal);
		}
		for (var y=0; y<ycells; y++) {
			ctx.moveTo(0, y*this._tileH);
			ctx.lineTo(xtotal, y*this._tileH);
		}
		ctx.stroke();
	},
	
	gridDisplay: function (w, h) {
		this._tileW = w;
		this._tileH = h;
		this.requires("Canvas");
		this.ctx = Crafty.canvas.context;
		this._drawGrid();
	}
});