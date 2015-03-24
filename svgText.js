fabric.SVGText = fabric.util.createClass(fabric.Object, {

	type        :'text-block',
	text        :'',
	fontSize    :24,
	color       :void 0,
	lineColors  :void 0,
	selectedLine:0,
	realWidth   :0,
	realHeight  :0,
	minWidth:0,
	minHeight:0,
	maxWidth:9999999,
	maxHeight:9999999,
	price:0,
	toObjectProperties:[],
	widths: [],
	font:null,
	fontFamily:null,
	lines:null,
	textAlign:'left',

	initialize: function (objects, options) {
		this.callSuper('initialize');

		if (options) {
			fabric.util.object.extend(this, options);
			//this.color = Backbone.toModel(this.color,Color);
		}
		this.lines = [];
		this.lineColors = [];
		options && this.set('minWidth', options.minWidth) && this.set('minHeight', options.minHeight) && this.set('maxWidth', options.maxWidth) && this.set('maxHeight', options.maxHeight) && this.set('toObjectProperties', options.toObjectProperties) && this.set('color', options.color);

		this.selectedLine = 0;
	},

	_render: function(ctx) {

		var numLines = this.lines.length;
		ctx.save();
		if (numLines > 0) {
			var em = parseFloat(this.font.fontface.unitsPerEm);
			var lineHeight = parseFloat(this.font.fontface.lineHeight);
			var fontScale = this.fontSize / em;
			ctx.scale(1, -1);
			ctx.scale(fontScale, fontScale);
			var firstLetter = this.lines[0][0];
			var xStart = em / 2;
			var yStart = /*em*/lineHeight / 2;
			ctx.translate(this.width/2/fontScale*-1+xStart,-this.font.fontface.descent);

			if (numLines > 1) {
				ctx.translate(0, this.height / 2 / fontScale - yStart);
			}

			var lastLineWidth = 0;
			for(var i=0; i<numLines; i++){
				var line = this.lines[i];
				var numLetters = line.length;
				var lineWidth = 0;
				if (this.textAlign == "center") {
					if (lastLineWidth > 0)
					ctx.translate(-(this.width / fontScale - lastLineWidth) / 2, 0);
					for(var l=0; l<numLetters; l++){
						var letter = line[l];
						var xOff = letter.glyph.horizAdvX - letter.kerning;

						lineWidth += xOff;
					}
					
					ctx.translate((this.width / fontScale - lineWidth) / 2, 0);
				}
				else if (this.textAlign == "right") {
					if (lastLineWidth > 0){
						ctx.translate(-(this.width / fontScale - lastLineWidth), 0);
					}
					for (var l = 0; l < numLetters; l++) {
						var letter = line[l];
						var xOff = letter.glyph.horizAdvX - letter.kerning;
						lineWidth += xOff;
					}
					ctx.translate(this.width / fontScale-lineWidth,0);
				}
				lineWidth = 0;
				for (var l = 0; l < numLetters; l++) {
					var letter = line[l];
					letter.render(ctx,true);
					var xOff = letter.glyph.horizAdvX - letter.kerning;
					ctx.translate(xOff,0);
					lineWidth += xOff;
				}
				ctx.translate(-lineWidth,-/*em*/lineHeight);
				lastLineWidth = lineWidth;
				}
		}
		ctx.restore();
	},

	previewColor:function (value, callback) {
		this.originalColor = this.color;
		this.color = this.lineColors[this.selectedLine] = value;
		//this.applyColor(this.color, callback);
		this.updateGlyphColors();
		callback && callback();
	},

	stopPreviewColor:function (callback) {
		this.color = this.lineColors[this.selectedLine] = this.originalColor;
		this.updateGlyphColors();
		callback && callback();
	},

	setColor:function (value, callback) {
		this.originalColor = this.color = this.lineColors[this.selectedLine] = value;
		//this.applyColor(value,callback);
		this.updateGlyphColors();
		callback && callback();
	},
	setColorAt: function(value,index,callback){
		this.lineColors[index] = value;
		this.updateGlyphColors();
		callback && callback();
	},
	setColorToAllLines:function(value,callback){

		this.originalColor = this.color = value;

		var len = this.lineColors.length;
		if(len == 0){
			this.lineColors[0] = value;
		}else{
			for(var i = 0; i < len; i++){
				this.lineColors[i] = value;
			}
		}
		this.updateGlyphColors();
		callback && callback();
	},

	setLineColors:function(value,callback){
		this.lineColors = value;
		this.updateGlyphColors();
		callback && callback();
	},

	getColors:function(){
		return this.lineColors;
	},

	getActiveColor:function(){
		return this.lineColors[this.selectedLine];
	},

	applyColor:function (value, callback) {
		if (value.get('pattern')) {
			this.callSuper('set', 'fill', value.get('pattern'));
		} else {
			this.callSuper('setColor', fabric.util.color.toHex(value.get('hex')));
		}
		this.updateGlyphColors();
	},

	getLineColor:function (line) {
		if (this.lineColors[line] != undefined) {
			var color = this.lineColors[line];
			if (color.get('pattern')) {
				return color.get('pattern');
			} else {
				return fabric.util.color.toHex(color.get('hex'));
			}
		} else {
			return this.fill;
		}
	},

	setFont: function(value){
		this.font = value;
		this.createGlyphs();
		return this;
	},

	setFontFamily: function(value){
		this.fontFamily = value;
		this.createGlyphs();
		return this;
	},

	setText: function(value){
		this.text = value;
		this.createGlyphs();
		return this;
	},

	getText: function(){
		return this.text;
	},

	removeAllObjects: function(){

	},

	getTextLines: function(){
		return this.text ? this.text.split(/\r?\n/) : [];
	},

	createGlyphs: function(){
		this.lines = [];

		if(this.font && this.text){
			var textLines = this.getTextLines();
			var numLines = textLines.length;
			this.widths = [];
			var w = 0;
			for(var i=0; i<numLines; i++){
				var line = textLines[i];
				var addLine = [];
				var numChars = line.length;
				var fill = this.getLineColor(i);
				var lineWidth = 0;

				for(var f=0; f<numChars; f++){
					var chr = line.charAt(f);
					var nextChar = line.charAt(f+1);
					var letter = this.drawGlyph(chr,nextChar);
					letter.set('fill',fill);
					addLine.push(letter);
					lineWidth += letter.glyph.horizAdvX - letter.kerning;
				}
				this.widths.push( lineWidth * this.fontSize / parseFloat(this.font.fontface.unitsPerEm));
				w = w < lineWidth ? lineWidth : w;
				this.lines.push(addLine);
			}

			var em = parseFloat(this.font.fontface.unitsPerEm);
			var fontScale = this.fontSize / em;

			this.width = w * fontScale;
			this.height = /*em*/ this.font.fontface.lineHeight * numLines * fontScale;

		}

	},

	updateGlyphColors: function(){
		var len = this.lines.length;
		for(var i=0; i<len; i++){
			var o = this.lines[i];
			var numLetters = o.length;
			for(var l=0; l<numLetters; l++){
				var letter = o[l];
				letter.set('fill', this.getLineColor(i));
			}

		};
	},

	getMaxGlyphHeight: function (){
		return Math.abs(this.font.fontface.descent) + Math.abs(this.font.fontface.ascent);
	},

	getGlyph: function (unicode){
		var code = unicode.charCodeAt(0).toString(16);
		var hexCode = '&#x' + code.toUpperCase();
		return this.font.glyphs[unicode] ? this.font.glyphs[unicode] : this.font.glyphs[hexCode];
	},

	getKerning: function(g,ng){
		var hkern = 0;
		if(ng){
			var g1 = g.glyphName;
			var g2 = ng.glyphName;

			//console.log(g1,g2);
			if(g1 && g2 && this.font.hkerns[g1] && this.font.hkerns[g1][g2]){
				return parseFloat(this.font.hkerns[g1][g2]);
			}

			var u1 = g.unicode;
			var u2 = ng.unicode;
			if(this.font.hkerns[u1] && this.font.hkerns[u1][u2]){
				return parseFloat(this.font.hkerns[u1][u2]);
			}

			if(u1 && u1.substr(0,3) != '&#x'){
				var ux1 = u1.charCodeAt(0).toString(16);
				var c1  = '&#X' + ux1.toUpperCase()+';';
			}else{
				c1 = u1;
			}

			if(u2 && u2.substr(0,3) != '&#x'){
				var ux2 = u2.charCodeAt(0).toString(16);
				var c2 = '&#X' + ux2.toUpperCase()+';';
			}else{
				c2 = u2;
			}

			if(this.font.hkerns[c1] && this.font.hkerns[c1][c2]){
				return parseFloat(this.font.hkerns[c1][c2]);
			}

			if(this.font.hkerns[u1] && this.font.hkerns[u1][c2]){
				return parseFloat(this.font.hkerns[u1][c2]);
			}

		}

		return hkern;
	},

	drawGlyph: function(unicode, nextChar){

		var maxGlyphHeight = this.getMaxGlyphHeight();
		var g = this.getGlyph(unicode);
		var ng = this.getGlyph(nextChar);

		if(!g) g = this.getMissingGlyph(unicode);

		var hkern = this.getKerning(g,ng);

		var em = parseFloat(this.font.fontface.unitsPerEm);
		var fontScale = this.fontSize / em;
		var p = g.data ? new fabric.Path(g.data,{top:0,left:0,width:this.font.fontface.unitsPerEm,height:this.font.fontface.lineHeight}) : new fabric.Path('Z');
		p.glyph = g; p.kerning = hkern;
		p.pathHeight = p.getHeight();
		p.pathWidth = p.getWidth();


		return p;
	},

	getMissingGlyph: function (unicode){
		return this.font.missingGlyph;
	},

	toObject:function () {
		var o = { objectParams: {} };
		var len = this.toObjectProperties.length;
		for(var i = 0; i < len; i++){
			o.objectParams[this.toObjectProperties[i]] = this[this.toObjectProperties[i]];
		}

		var lcolors = [];
		_(this.lineColors).each(function(col,key){
			lcolors[key] = col.attributes;
		});

		o = fabric.util.object.extend(o, {text:this.text, fontFamily: this.fontFamily, fontSize: this.fontSize, textAlign: this.textAlign, widths:this.widths});
		o = fabric.util.object.extend(o, {lineColors:lcolors, color: this.color ? this.color.attributes : null, realWidth:this.realWidth, realHeight:this.realHeight, minWidth: this.minWidth, minHeight: this.minHeight, maxWidth: this.maxWidth, maxHeight: this.maxHeight,  transformMatrix:this.getMatrix(),oCoords: this.oCoords, price: this.price, width:this.width, height:this.height});
		o = fabric.util.object.extend(this.callSuper('toObject'), o);
		return o;
	}

});

fabric.SVGText.fromObject = function (object) {
	return new fabric.SVGText(object.text, fabric.util.object.clone(object));
};

fabric.TextBlock = fabric.SVGText; //alias
