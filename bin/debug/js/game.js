(function (console, $global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var AnaglyphEffect = function(renderer,stereoCamera,width,height) {
	this.renderer = renderer;
	this.stereo = stereoCamera;
	this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
	this.scene = new THREE.Scene();
	this.params = { minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter, format : THREE.RGBAFormat};
	this.left = new THREE.WebGLRenderTarget(width,height,this.params);
	this.right = new THREE.WebGLRenderTarget(width,height,this.params);
	this.material = new THREE.ShaderMaterial({ vertexShader : shaders_Anaglyph.vertexShader, fragmentShader : shaders_Anaglyph.fragmentShader, uniforms : shaders_Anaglyph.uniforms});
	this.material.uniforms.tLeft.value = this.left;
	this.material.uniforms.tRight.value = this.right;
	this.material.uniforms.type.value = 0;
	var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),this.material);
	this.scene.add(mesh);
};
AnaglyphEffect.__name__ = true;
AnaglyphEffect.prototype = {
	setSize: function(width,height) {
		this.left.setSize(width,height);
		this.right.setSize(width,height);
		this.renderer.setSize(width,height);
	}
	,render: function(scene,camera) {
		scene.updateMatrixWorld(true);
		if(camera.parent == null) camera.updateMatrixWorld(true);
		this.stereo.update(camera);
		this.renderer.render(scene,this.stereo.cameraL,this.left,true);
		this.renderer.render(scene,this.stereo.cameraR,this.right,true);
		this.renderer.render(this.scene,this.camera);
	}
	,__class__: AnaglyphEffect
};
var AsymmetricStereoEffect = function(renderer,stereoCamera,width,height) {
	this.renderer = renderer;
	this.stereo = stereoCamera;
	this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
	this.scene = new THREE.Scene();
	this.params = { minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter, format : THREE.RGBAFormat};
	this.left = new THREE.WebGLRenderTarget(width,height,this.params);
	this.right = new THREE.WebGLRenderTarget(width,height,this.params);
	this.material = new THREE.ShaderMaterial({ vertexShader : shaders_AsymmetricStereo.vertexShader, fragmentShader : shaders_AsymmetricStereo.fragmentShader, uniforms : shaders_AsymmetricStereo.uniforms});
	this.material.uniforms.tLeft.value = this.left;
	this.material.uniforms.tRight.value = this.right;
	var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),this.material);
	this.scene.add(mesh);
};
AsymmetricStereoEffect.__name__ = true;
AsymmetricStereoEffect.prototype = {
	setSize: function(width,height) {
		this.left.setSize(width,height);
		this.right.setSize(width,height);
		this.renderer.setSize(width,height);
	}
	,render: function(scene,camera) {
		scene.updateMatrixWorld(true);
		if(camera.parent == null) camera.updateMatrixWorld(true);
		this.stereo.update(camera);
		this.renderer.render(scene,this.stereo.cameraL,this.left,true);
		this.renderer.render(scene,this.stereo.cameraR,this.right,true);
		this.renderer.render(this.scene,this.camera);
	}
	,__class__: AsymmetricStereoEffect
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
var Main = function() {
	this.shaderGUI = new dat.GUI({ autoPlace : true});
	window.onload = $bind(this,this.onWindowLoaded);
};
Main.__name__ = true;
Main.main = function() {
	var main = new Main();
};
Main.prototype = {
	onWindowLoaded: function() {
		var _g = this;
		var gameDiv = window.document.createElement("attach");
		var glSupported = WebGLDetector.detect();
		if(glSupported != 0) {
			var unsupportedInfo = window.document.createElement("div");
			unsupportedInfo.style.position = "absolute";
			unsupportedInfo.style.top = "10px";
			unsupportedInfo.style.width = "100%";
			unsupportedInfo.style.textAlign = "center";
			unsupportedInfo.style.color = "#ffffff";
			switch(glSupported) {
			case 2:
				unsupportedInfo.innerHTML = "Your browser does not support WebGL. Click <a href=\"" + "https://github.com/Tw1ddle/Stereoscopics" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			case 1:
				unsupportedInfo.innerHTML = "Your browser supports WebGL, but the feature appears to be disabled. Click <a href=\"" + "https://github.com/Tw1ddle/Stereoscopics" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			default:
				unsupportedInfo.innerHTML = "Could not detect WebGL support. Click <a href=\"" + "https://github.com/Tw1ddle/Stereoscopics" + "\" target=\"_blank\">here for project info</a> instead.";
			}
			gameDiv.appendChild(unsupportedInfo);
			return;
		}
		this.renderer = new THREE.WebGLRenderer({ antialias : true});
		this.renderer.sortObjects = false;
		this.renderer.autoClear = false;
		this.renderer.setClearColor(new THREE.Color(0));
		this.renderer.setPixelRatio(window.devicePixelRatio);
		var gameAttachPoint = window.document.getElementById("game");
		gameAttachPoint.appendChild(gameDiv);
		var container = window.document.createElement("div");
		window.document.body.appendChild(container);
		var info = window.document.createElement("div");
		info.style.position = "absolute";
		info.style.top = "20px";
		info.style.width = "100%";
		info.style.textAlign = "center";
		info.style.color = "white";
		info.innerHTML = "<a href=\"" + "https://github.com/Tw1ddle/Stereoscopics" + "\" target=\"_blank\">" + "Stereoscopics" + "</a> by <a href=\"" + "http://samcodes.co.uk/" + "\" target=\"_blank\">Sam Twidale</a>.";
		container.appendChild(info);
		var width = window.innerWidth * this.renderer.getPixelRatio();
		var height = window.innerHeight * this.renderer.getPixelRatio();
		this.scene = new THREE.Scene();
		this.monoCamera = new THREE.PerspectiveCamera(60,width / height,2.0,10000.0);
		this.monoCamera.position.set(0,0,10);
		this.monoCamera.focalLength = 10;
		this.stereoCamera = new THREE.StereoCamera();
		var sphere = new THREE.SphereBufferGeometry(32,32,16);
		var plane = new THREE.PlaneBufferGeometry(10,10,1,1);
		var material = new THREE.MeshBasicMaterial({ color : 12303291});
		var zeroPlane = new THREE.Mesh(plane,material);
		zeroPlane.position.set(-5,5,0);
		this.scene.add(zeroPlane);
		var _g1 = 0;
		while(_g1 < 20) {
			var i = _g1++;
			var mesh = new THREE.Mesh(sphere,material);
			mesh.position.set(Math.random() * 500 - 250,Math.random() * 500 - 250,-200 - Math.random() * 500);
			this.scene.add(mesh);
		}
		this.effect = "Anaglyph";
		this.anaglyphEffect = new AnaglyphEffect(this.renderer,this.stereoCamera,width,height);
		this.anaglyphEffect.setSize(width,height);
		this.toeInEffect = new ToeInEffect(this.renderer,this.stereoCamera,width,height);
		this.toeInEffect.setSize(width,height);
		this.symmetricStereoEffect = new SymmetricStereoEffect(this.renderer,this.stereoCamera,width,height);
		this.symmetricStereoEffect.setSize(width,height);
		this.asymmetricStereoEffect = new AsymmetricStereoEffect(this.renderer,this.stereoCamera,width,height);
		this.asymmetricStereoEffect.setSize(width,height);
		this.onResize();
		window.addEventListener("resize",function() {
			_g.onResize();
		},true);
		window.addEventListener("contextmenu",function(event1) {
			event1.preventDefault();
		},true);
		window.addEventListener("keypress",function(event2) {
			event2.preventDefault();
		},true);
		window.addEventListener("keydown",function(event3) {
			event3.preventDefault();
		},true);
		var onMouseWheel = function(event) {
			event.preventDefault();
		};
		window.document.addEventListener("mousewheel",onMouseWheel,false);
		window.document.addEventListener("DOMMouseScroll",onMouseWheel,false);
		this.shaderGUI.add(this,"effect",{ Anaglyph : "Anaglyph", Toein : "Toe-in", Symmetric : "Symmetric Stereo", Asymmetric : "Asymmetric Stereo"}).listen();
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.monoCamera,"Mono Camera");
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.stereoCamera,"Stereo Camera");
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.stereoCamera.cameraL,"Stereo Camera Left");
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.stereoCamera.cameraR,"Stereo Camera Right");
		dat_ShaderGUI.generate(this.shaderGUI,"Anaglyph",this.anaglyphEffect.material.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"Toe-in",this.toeInEffect.material.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"Symmetric",this.symmetricStereoEffect.material.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"Asymmetric",this.asymmetricStereoEffect.material.uniforms);
		this.setupStats(null);
		gameDiv.appendChild(this.renderer.domElement);
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,onResize: function() {
		var width = window.innerWidth * this.renderer.getPixelRatio();
		var height = window.innerHeight * this.renderer.getPixelRatio();
		this.renderer.setSize(window.innerWidth,window.innerHeight);
		this.anaglyphEffect.setSize(width,height);
		this.monoCamera.aspect = width / height;
		this.monoCamera.updateProjectionMatrix();
	}
	,animate: function(time) {
		this.stats.begin();
		Main.dt = (time - Main.lastAnimationTime) * 0.001;
		Main.lastAnimationTime = time;
		var _g = this.effect;
		switch(_g) {
		case "Anaglyph":
			this.anaglyphEffect.render(this.scene,this.monoCamera);
			break;
		case "Toe-in":
			this.toeInEffect.render(this.scene,this.monoCamera);
			break;
		case "Symmetric Stereo":
			this.symmetricStereoEffect.render(this.scene,this.monoCamera);
			break;
		case "Asymmetric Stereo":
			this.asymmetricStereoEffect.render(this.scene,this.monoCamera);
			break;
		}
		window.requestAnimationFrame($bind(this,this.animate));
		this.stats.end();
	}
	,setupGUI: function() {
		this.shaderGUI.add(this,"effect",{ Anaglyph : "Anaglyph", Toein : "Toe-in", Symmetric : "Symmetric Stereo", Asymmetric : "Asymmetric Stereo"}).listen();
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.monoCamera,"Mono Camera");
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.stereoCamera,"Stereo Camera");
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.stereoCamera.cameraL,"Stereo Camera Left");
		dat_ThreeObjectGUI.addItem(this.shaderGUI,this.stereoCamera.cameraR,"Stereo Camera Right");
		dat_ShaderGUI.generate(this.shaderGUI,"Anaglyph",this.anaglyphEffect.material.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"Toe-in",this.toeInEffect.material.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"Symmetric",this.symmetricStereoEffect.material.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"Asymmetric",this.asymmetricStereoEffect.material.uniforms);
	}
	,setupStats: function(mode) {
		if(mode == null) mode = 2;
		var actual = this.stats;
		var expected = null;
		if(actual != expected) throw new js__$Boot_HaxeError("FAIL: values are not equal (expected: " + Std.string(expected) + ", actual: " + Std.string(actual) + ")");
		this.stats = new Stats();
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.left = "0px";
		this.stats.domElement.style.top = "0px";
		window.document.body.appendChild(this.stats.domElement);
	}
	,__class__: Main
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var SymmetricStereoEffect = function(renderer,stereoCamera,width,height) {
	this.renderer = renderer;
	this.stereo = stereoCamera;
	this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
	this.scene = new THREE.Scene();
	this.params = { minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter, format : THREE.RGBAFormat};
	this.left = new THREE.WebGLRenderTarget(width,height,this.params);
	this.right = new THREE.WebGLRenderTarget(width,height,this.params);
	this.material = new THREE.ShaderMaterial({ vertexShader : shaders_SymmetricStereo.vertexShader, fragmentShader : shaders_SymmetricStereo.fragmentShader, uniforms : shaders_SymmetricStereo.uniforms});
	this.material.uniforms.tLeft.value = this.left;
	this.material.uniforms.tRight.value = this.right;
	var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),this.material);
	this.scene.add(mesh);
};
SymmetricStereoEffect.__name__ = true;
SymmetricStereoEffect.prototype = {
	setSize: function(width,height) {
		this.left.setSize(width,height);
		this.right.setSize(width,height);
		this.renderer.setSize(width,height);
	}
	,render: function(scene,camera) {
		scene.updateMatrixWorld(true);
		if(camera.parent == null) camera.updateMatrixWorld(true);
		this.stereo.update(camera);
		this.renderer.render(scene,this.stereo.cameraL,this.left,true);
		this.renderer.render(scene,this.stereo.cameraR,this.right,true);
		this.renderer.render(this.scene,this.camera);
	}
	,__class__: SymmetricStereoEffect
};
var ToeInEffect = function(renderer,stereoCamera,width,height) {
	this.renderer = renderer;
	this.stereo = stereoCamera;
	this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
	this.scene = new THREE.Scene();
	this.params = { minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter, format : THREE.RGBAFormat};
	this.left = new THREE.WebGLRenderTarget(width,height,this.params);
	this.right = new THREE.WebGLRenderTarget(width,height,this.params);
	this.material = new THREE.ShaderMaterial({ vertexShader : shaders_ToeIn.vertexShader, fragmentShader : shaders_ToeIn.fragmentShader, uniforms : shaders_ToeIn.uniforms});
	this.material.uniforms.tLeft.value = this.left;
	this.material.uniforms.tRight.value = this.right;
	var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),this.material);
	this.scene.add(mesh);
};
ToeInEffect.__name__ = true;
ToeInEffect.prototype = {
	setSize: function(width,height) {
		this.left.setSize(width,height);
		this.right.setSize(width,height);
		this.renderer.setSize(width,height);
	}
	,render: function(scene,camera) {
		scene.updateMatrixWorld(true);
		if(camera.parent == null) camera.updateMatrixWorld(true);
		this.stereo.update(camera);
		this.renderer.render(scene,this.stereo.cameraL,this.left,true);
		this.renderer.render(scene,this.stereo.cameraR,this.right,true);
		this.renderer.render(this.scene,this.camera);
	}
	,__class__: ToeInEffect
};
var dat_ShaderGUI = function() { };
dat_ShaderGUI.__name__ = true;
dat_ShaderGUI.generate = function(gui,folderName,uniforms,exclude) {
	var keys = Reflect.fields(uniforms);
	var folder = gui.addFolder(folderName);
	var _g = 0;
	while(_g < keys.length) {
		var key = keys[_g];
		++_g;
		var v = Reflect.getProperty(uniforms,key);
		if(exclude != null && HxOverrides.indexOf(exclude,key,0) != -1) continue;
		var type = v.type;
		var value = v.value;
		switch(type) {
		case "i":case "f":
			if(Object.prototype.hasOwnProperty.call(v,"min") && Object.prototype.hasOwnProperty.call(v,"max")) folder.add(v,"value").listen().min(v.min).max(v.max).name(key); else folder.add(v,"value").listen().name(key);
			break;
		case "v2":
			var f = folder.addFolder(key);
			f.add(v.value,"x").listen().name(key + "_x");
			f.add(v.value,"y").listen().name(key + "_y");
			break;
		case "v3":
			var f1 = folder.addFolder(key);
			f1.add(v.value,"x").listen().name(key + "_x");
			f1.add(v.value,"y").listen().name(key + "_y");
			f1.add(v.value,"z").listen().name(key + "_z");
			break;
		case "v4":
			var f2 = folder.addFolder(key);
			f2.add(v.value,"x").listen().name(key + "_x");
			f2.add(v.value,"y").listen().name(key + "_y");
			f2.add(v.value,"z").listen().name(key + "_z");
			f2.add(v.value,"w").listen().name(key + "_w");
			break;
		}
	}
	return folder;
};
var dat_ThreeObjectGUI = function() { };
dat_ThreeObjectGUI.__name__ = true;
dat_ThreeObjectGUI.addItem = function(gui,object,tag) {
	if(gui == null || object == null) return null;
	var folder = null;
	if(tag != null) folder = gui.addFolder(tag + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")"); else {
		var name = Std.string(Reflect.field(object,"name"));
		if(name == null || name.length == 0) folder = gui.addFolder("Item (" + dat_ThreeObjectGUI.guiItemCount++ + ")"); else folder = gui.addFolder(Std.string(Reflect.getProperty(object,"name")) + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")");
	}
	if(js_Boot.__instanceof(object,THREE.Scene)) {
		var scene = object;
		var _g = 0;
		var _g1 = scene.children;
		while(_g < _g1.length) {
			var object1 = _g1[_g];
			++_g;
			dat_ThreeObjectGUI.addItem(gui,object1);
		}
	}
	if(js_Boot.__instanceof(object,THREE.Object3D)) {
		var object3d = object;
		folder.add(object3d.position,"x",-5000.0,5000.0,2).listen();
		folder.add(object3d.position,"y",-5000.0,5000.0,2).listen();
		folder.add(object3d.position,"z",-20000.0,20000.0,2).listen();
		folder.add(object3d.rotation,"x",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.rotation,"y",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.rotation,"z",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.scale,"x",0.0,10.0,0.01).listen();
		folder.add(object3d.scale,"y",0.0,10.0,0.01).listen();
		folder.add(object3d.scale,"z",0.0,10.0,0.01).listen();
	}
	if(js_Boot.__instanceof(object,THREE.PointLight)) {
		var light = object;
		folder.add(light,"intensity",0,3,0.01).listen();
	}
	var _g2 = 0;
	var _g11 = Reflect.fields(object);
	while(_g2 < _g11.length) {
		var field = _g11[_g2];
		++_g2;
		var prop = Reflect.getProperty(object,field);
		if(((prop | 0) === prop)) folder.add(object,field).listen(); else if(typeof(prop) == "number") folder.add(object,field).listen();
	}
	return folder;
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var shaders_Anaglyph = function() { };
shaders_Anaglyph.__name__ = true;
var shaders_AsymmetricStereo = function() { };
shaders_AsymmetricStereo.__name__ = true;
var shaders_SymmetricStereo = function() { };
shaders_SymmetricStereo.__name__ = true;
var shaders_ToeIn = function() { };
shaders_ToeIn.__name__ = true;
var util_FileReader = function() { };
util_FileReader.__name__ = true;
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
Main.REPO_NAME = "Stereoscopics";
Main.REPO_URL = "https://github.com/Tw1ddle/Stereoscopics";
Main.WEBSITE_URL = "http://samcodes.co.uk/";
Main.TWITTER_URL = "https://twitter.com/Sam_Twidale";
Main.HAXE_URL = "http://haxe.org/";
Main.lastAnimationTime = 0.0;
Main.dt = 0.0;
dat_ThreeObjectGUI.guiItemCount = 0;
js_Boot.__toStr = {}.toString;
shaders_Anaglyph.uniforms = { tLeft : { type : "t", value : null}, tRight : { type : "t", value : null}, type : { type : "i", value : 0}};
shaders_Anaglyph.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_Anaglyph.fragmentShader = "varying vec2 vUv;\r\n\r\nuniform sampler2D tLeft;\r\nuniform sampler2D tRight;\r\nuniform int type;\r\n\r\nvoid main()\r\n{\r\n\tvec4 colorLeft = texture2D(tLeft, vUv);\r\n\tvec4 colorRight = texture2D(tRight, vUv);\r\n\t\r\n\tif(type == 0)\r\n\t{\r\n\t\t// Based on http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx\r\n\t\tgl_FragColor = vec4(colorLeft.g * 0.7 + colorLeft.b * 0.3, colorRight.g, colorRight.b, colorLeft.a + colorRight.a);\r\n\t}\r\n\telse\r\n\t{\r\n\t\tgl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\r\n\t}\r\n}";
shaders_AsymmetricStereo.uniforms = { tLeft : { type : "t", value : null}, tRight : { type : "t", value : null}};
shaders_AsymmetricStereo.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_AsymmetricStereo.fragmentShader = "varying vec2 vUv;\r\n\r\nuniform sampler2D tLeft;\r\nuniform sampler2D tRight;\r\n\r\nvoid main()\r\n{\r\n\tvec4 colorLeft = texture2D(tLeft, vUv);\r\n\tvec4 colorRight = texture2D(tRight, vUv);\r\n\t\r\n\tgl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);\r\n}";
shaders_SymmetricStereo.uniforms = { tLeft : { type : "t", value : null}, tRight : { type : "t", value : null}};
shaders_SymmetricStereo.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_SymmetricStereo.fragmentShader = "varying vec2 vUv;\r\n\r\nuniform sampler2D tLeft;\r\nuniform sampler2D tRight;\r\n\r\nvoid main()\r\n{\r\n\tvec4 colorLeft = texture2D(tLeft, vUv);\r\n\tvec4 colorRight = texture2D(tRight, vUv);\r\n\t\r\n\tgl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\r\n}";
shaders_ToeIn.uniforms = { tLeft : { type : "t", value : null}, tRight : { type : "t", value : null}};
shaders_ToeIn.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_ToeIn.fragmentShader = "varying vec2 vUv;\r\n\r\nuniform sampler2D tLeft;\r\nuniform sampler2D tRight;\r\n\r\nvoid main()\r\n{\r\n\tvec4 colorLeft = texture2D(tLeft, vUv);\r\n\tvec4 colorRight = texture2D(tRight, vUv);\r\n\t\r\n\tgl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\r\n}";
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);

//# sourceMappingURL=game.js.map