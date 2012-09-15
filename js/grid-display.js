// ----------------------------------------------------------------- //
// Grid Display
// ----------------------------------------------------------------- //
Crafty.c("GridDisplay", {
	gridDisplay: function (w, h) {
		var stage = $(Crafty.stage.elem);
		var xtotal = stage.outerWidth();
		var ytotal = stage.outerHeight();
		
		for(var x=0; x<xtotal; x+=w) {
			for(var y=0; y<ytotal; y+=h) {
				Crafty.e("GridDisplayCell").gridDisplayCell(x, y, w, h);
			}
		}
			
	},
	
	init: function () {
		// Grab dependencies.
		this.requires("2D, DOM, HTML");
		
		// Define sub-component.
		Crafty.c("GridDisplayCell", {
			gridDisplayCell: function (x, y, w, h) {
				this.attr({
					"x": x,
					"y": y,
					"w": w,
					"h": h
				});
				this.css({
					"border": "1px solid black"
				});
			},
			init: function () {
				this.requires("2D, DOM, HTML, Color");
			}
		});
	}
});