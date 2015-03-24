fabric.util.loadFont = function(url,callback){
    new fabric.util.request(url, {
        method: 'get',
        onComplete: function(r){
            var xml = r.responseXML;
            
            if (!xml.documentElement && fabric.window.ActiveXObject && r.responseText) {
              xml = new ActiveXObject('Microsoft.XMLDOM');
              xml.async = 'false';
              //IE chokes on DOCTYPE
              xml.loadXML(r.responseText.replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*\])*?>/i,''));
            }
            if (!xml.documentElement) return;
            
            var font = fabric.util.parseFont(xml);
            callback && callback(font);
            
        }
    });
};

fabric.util.parseFont = function(xml){

    var doc = xml.documentElement;
    
    var defs = doc.getElementsByTagName("defs");
    var def = defs[0];
    var fonts = def.getElementsByTagName("font"); 
    var node = fonts[0];
    var def = {};
    def.id = node.id;
    def.horizAdvX = parseFloat(node.getAttribute("horiz-adv-x"));
    
    var face = {};
    var nfx = node.getElementsByTagName("font-face")[0];
    face.fontFamily = nfx.getAttribute("font-family");
    face.fontWeight = nfx.getAttribute("font-weight");
    face.fontStretch = nfx.getAttribute("font-stretch");
    face.unitsPerEm = parseFloat(nfx.getAttribute("units-per-em"));
    face.panose1 = nfx.getAttribute("panose-1");
    face.ascent = parseFloat(nfx.getAttribute("ascent"));
    face.descent = parseFloat(nfx.getAttribute("descent"));
    face.alphabetic = nfx.getAttribute("alphabetic");
    face.xHeight = parseFloat(nfx.getAttribute("x-height"));
    face.capHeight = parseFloat(nfx.getAttribute("cap-height"));  		
    face.underlineThickness = parseFloat(nfx.getAttribute("underline-thickness"));
    face.underlinePosition = parseFloat(nfx.getAttribute("underline-position"));
    face.lineHeight = Math.abs(face.ascent)+Math.abs(face.descent);
    var str = nfx.getAttribute("bbox");
    if(str && str.length > 0){
        var spl = str.split(" ");
        face.bbox = {x:spl[0],y:spl[1],width:spl[2],height:spl[3]};
    }

    def.fontface = face;

    var glyphs = {};
    
    var glyphList = node.getElementsByTagName('glyph');
    var glen = glyphList.length;
    
    for (var i = 0; i<glen; i++){
        var glyphXML = glyphList[i];
        var g = {};
        g.unicode = glyphXML.getAttribute("unicode");
        g.glyphName = glyphXML.getAttribute("glyph-name");
        g.horizAdvX = parseFloat(glyphXML.getAttribute("horiz-adv-x"));
        g.horizAdvX = isNaN(g.horizAdvX) ? def.horizAdvX : g.horizAdvX;
        if(glyphXML.getAttribute('d')){
            g.data = glyphXML.getAttribute('d').split("\n").join(" ").split("\r").join(" ");
        }else{
            g.data = null;
        }
        if(g.unicode){
            glyphs[g.unicode] = g;
        }
    }

    def.glyphs = glyphs;

    var missingGlyphXML = node.getElementsByTagName("missing-glyph")[0];
    var mg = {};
    if(missingGlyphXML.getAttribute('d'))
        mg.data = missingGlyphXML.getAttribute('d').split("\n").join(" ").split("\r").join(" ");
    
    mg.horizAdvX = missingGlyphXML.getAttribute("horiz-adv-x");
    def.missingGlyph = mg;

    var hkerns = {};
    
    var hkernList = node.getElementsByTagName('hkern');
    var hlen = hkernList.length;
    //console.log(hkernList);
    for(var i = 0; i<hlen; i++){				
        var kernXML = hkernList[i];
        var g1 = kernXML.getAttribute('g1');
        var g2 = kernXML.getAttribute('g2');
        var u1 = kernXML.getAttribute('u1');
        var u2 = kernXML.getAttribute('u2');
        
        var k = kernXML.getAttribute('k');
        if(g1 && g2){
            if(!hkerns[g1]) hkerns[g1] = {};
            hkerns[g1][g2] = parseFloat(k);        
        }
        if(u1 && u2){
            u1 = u1.substr(0,3).toUpperCase() == '&#X' ? u1.toUpperCase() : u1;
            u2 = u2.substr(0,3).toUpperCase() == '&#X' ? u2.toUpperCase() : u2;
            if(!hkerns[u1]) hkerns[u1] = {};
            hkerns[u1][u2] = parseFloat(k);        
        }
        
    }

    def.hkerns = hkerns;

    return def;
    
};
