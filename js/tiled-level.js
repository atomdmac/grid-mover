(function () {
	Crafty.c("TiledLevel", {
		
		// An array of tileset objects imported from the map.
		tilesets: null,
		
		/** 
		 * Create tile components to be added to tile entities via makeLayer().
		 * New components are created for each tile in a tileset.
		 * @param ts The tilesets that this map contains.
		 * @param drawType The rendering engine that Crafty should draw the map with.
		 * @return Void
		 */
		makeTiles : function (ts, drawType) {
			
			var components,
			i,
			posx,
			posy,
			sMap,
			sName,
			tHeight,
			tName,
			tNum,
			tWidth,
			tsHeight,
			tsImage,
			tsProperties,
			tsWidth,
			xCount,
			yCount,
			_ref;
			tsImage = ts.image,
			tNum = ts.firstgid,
			tsWidth = ts.imagewidth;
			tsHeight = ts.imageheight,
			tWidth = ts.tilewidth,
			tHeight = ts.tileheight;
			tsProperties = ts.tileproperties;
			xCount = tsWidth / tWidth | 0;
			yCount = tsHeight / tHeight | 0;
			sMap = {};
			
			for (i = 0, _ref = yCount * xCount; i < _ref; i += 1) {
				posx = i % xCount;
				posy = i / xCount | 0;
				sName = "tileSprite" + tNum;
				tName = "tile" + tNum;
				sMap[sName] = [posx, posy];
				components = "2D, " + drawType + ", " + sName + ", MapTile";
				
				// Add any components listed in the tileset tile's "components"
				// property.  NOTE: This should be a comma-delimited list.
				if (tsProperties) {
					var index = String(Number(tNum - 1));
					if (tsProperties[i]) {
						if (tsProperties[i]["components"]) {
							components += ", " + tsProperties[i]["components"];
						}
					}
				}
				
				Crafty.c(tName, {
					comp : components,
					init : function () {
						this.addComponent(this.comp);
						return this;
					}
				});
				tNum++;
			}
			
			Crafty.sprite(tWidth, tHeight, tsImage, sMap);
			return null;
		},
		
		/**
		 * Renders a layer by applying the tile components created in
		 * makeTiles() to new entities.
		 * @param layer An Object describing the layer to be created.
		 * @param tilesets An Array of the tilesets that this map contains.
		 * @return Void
		 */
		makeLayer : function (layer, tilesets) {
			var i,
			lData,
			lHeight,
			lWidth,
			tDatum,
			tile,
			_len;
			lData = layer.data,
			lWidth = layer.width,
			lHeight = layer.height;
			
			// Are we dealing with a collision layer?
			var isCol = layer.name.toLowerCase().indexOf("collision") >= 0;
			
			// Create a tile layer.
			if(layer.type == "tilelayer") {
				for (i = 0, _len = lData.length; i < _len; i++) {
					tDatum = lData[i];
					if (tDatum) {
						tile = Crafty.e("tile" + tDatum);
						tile.x = (i % lWidth) * tile.w;
						tile.y = (i / lWidth | 0) * tile.h;
						
						// Hide tile if this is a collision layer.
						if(isCol) tile.visible = false;
						if(isCol) console.log(tile);;
					}
				}
			}
			
			// Create an entity/object layer.
			else if(layer.type == "objectgroup") {
				for (i = 0, _len = layer.objects.length; i < _len; i++) {
					tDatum = layer.objects[i];
					if (tDatum) {
						// Create a component using the object's type property.
						var obj = Crafty.e(tDatum.type);
						
						// Call initializer function and include the entity's
						// image as a parameter so we can display the entity.
						// 
						// NOTE: The initializer is expected to be an all 
						// lowercase version of the component name.
						obj[tDatum.type.toLowerCase()](tilesets[tDatum.properties.image].image);
						
						// Position that stuff!
						obj.x = tDatum.x;
						obj.y = tDatum.y;
					}
				}
			}
			return null;
		},
		
		/**
		 * Load the map at the specified URL.
		 * @param levelURL A String that describes the URL to load the map from.
		 * @param drawType A String that describes which rendering engine to use.
		 * @return Void
		 */
		tiledLevel : function (levelURL, drawType, callback) {
			var _this = this;
			$.ajax({
				type : 'GET',
				url : levelURL,
				dataType : 'json',
				data : {},
				async : false,
				success : function (level) {
					var lLayers,
					ts,
					tsImages,
					tss;
					lLayers = level.layers,
					tss = level.tilesets;
					
					// Store tilesets for later with named keys.
					_this.tilesets = {};
					for(var a in level.tilesets) {
						var key = level.tilesets[a].name;
						_this.tilesets[key] = level.tilesets[a];
					}
					
					drawType = drawType != null ? drawType : "Canvas";
					tsImages = (function () {
						var _i,
						_len,
						_results;
						_results = [];
						for (_i = 0, _len = tss.length; _i < _len; _i++) {
							ts = tss[_i];
							_results.push(ts.image);
						}
						return _results;
					})();
					Crafty.load(tsImages, function () {
						var layer,
						ts,
						_i,
						_j,
						_len,
						_len2;
						for (_i = 0, _len = tss.length; _i < _len; _i++) {
							ts = tss[_i];
							_this.makeTiles(ts, drawType);
						}
						for (_j = 0, _len2 = lLayers.length; _j < _len2; _j++) {
							layer = lLayers[_j];
							_this.makeLayer(layer, _this.tilesets);
						}
						callback();
						return null;
					});
					
					return null;
				}
			});
			return this;
		},
		
		init : function () {
			// Create collidable components to be used for tiles that are 
			// impassable.
			Crafty.c("Solid", {
				init: function() {
					this.requires("Collision");
					this.collision([0,0], [32,0], [32,32], [0,32]);
				}
			});
			Crafty.c("NWSlant", {
				init: function() {
					this.requires("Collision");
					var hitArea = new Crafty.polygon([[0, 32], [32, 0], [32, 32]]);
					this.collision([0, 32], [32, 0], [32, 32]);
				}
			});
			Crafty.c("NESlant", {
				init: function() {
					this.requires("Collision");
					var hitArea = new Crafty.polygon([[0, 0], [32, 32], [0, 32]]);
					this.collision([0, 0], [32, 32], [0, 32]);
				}
			});
			Crafty.c("SWSlant", {
				init: function() {
					this.requires("Collision");
					var hitArea = new Crafty.polygon([[0,0], [32,0], [32,32]]);
					this.collision([0,0], [32,0], [32,32]);
				}
			});
			Crafty.c("SESlant", {
				init: function() {
					this.requires("Collision");
					var hitArea = new Crafty.polygon([[0,0], [32,0], [0,32]]);
					this.collision([0,0], [32,0], [0,32]);
				}
			});
			return this;
		}
	});
	
}).call(this);
