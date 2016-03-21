package;

import dat.GUI;
import dat.ShaderGUI;
import dat.ThreeObjectGUI;
import js.Browser;
import stats.Stats;
import three.Color;
import three.Mesh;
import three.MeshBasicMaterial;
import three.PerspectiveCamera;
import three.PlaneBufferGeometry;
import three.Scene;
import three.SphereBufferGeometry;
import three.StereoCamera;
import three.WebGLRenderer;
import webgl.Detector;

@:enum abstract Effect(String) from String to String {
	var ANAGLYPH = "Anaglyph";
	var TOE_IN = "Toe-in";
	var SYMMETRIC_STEREO = "Symmetric Stereo";
	var ASYMMETRIC_STEREO = "Asymmetric Stereo";
}

class Main {
	public static inline var REPO_NAME:String = "Stereoscopics";
	public static inline var REPO_URL:String = "https://github.com/Tw1ddle/Stereoscopics";
	public static inline var WEBSITE_URL:String = "http://samcodes.co.uk/";
	public static inline var TWITTER_URL:String = "https://twitter.com/Sam_Twidale";
	public static inline var HAXE_URL:String = "http://haxe.org/";
	
	private var renderer:WebGLRenderer;
	private var scene:Scene;
	private var monoCamera:PerspectiveCamera;
	private var stereoCamera:StereoCamera;
	
	private var effect:Effect; // Current effect
	
	// Stereo techniques
	private var anaglyphEffect:AnaglyphEffect;
	private var toeInEffect:ToeInEffect;
	private var asymmetricStereoEffect:AsymmetricStereoEffect;
	private var symmetricStereoEffect:SymmetricStereoEffect;
	
	private static var lastAnimationTime:Float = 0.0; // Last time from requestAnimationFrame
	private static var dt:Float = 0.0; // Frame delta time
	
	private var shaderGUI:GUI = new GUI( { autoPlace:true } );
	
	#if debug
	private var stats(default, null):Stats;
	#end
	
    private static function main():Void {
		var main = new Main();
	}
	
	private inline function new() {
		Browser.window.onload = onWindowLoaded;
	}
	
	private inline function onWindowLoaded():Void {
		var gameDiv = Browser.document.createElement("attach");
		
		// WebGL support check
		var glSupported:WebGLSupport = Detector.detect();
		if (glSupported != SUPPORTED_AND_ENABLED) {
			var unsupportedInfo = Browser.document.createElement('div');
			unsupportedInfo.style.position = 'absolute';
			unsupportedInfo.style.top = '10px';
			unsupportedInfo.style.width = '100%';
			unsupportedInfo.style.textAlign = 'center';
			unsupportedInfo.style.color = '#ffffff';
			
			switch(glSupported) {
				case WebGLSupport.NOT_SUPPORTED:
					unsupportedInfo.innerHTML = 'Your browser does not support WebGL. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
				case WebGLSupport.SUPPORTED_BUT_DISABLED:
					unsupportedInfo.innerHTML = 'Your browser supports WebGL, but the feature appears to be disabled. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
				default:
					unsupportedInfo.innerHTML = 'Could not detect WebGL support. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
			}
			
			gameDiv.appendChild(unsupportedInfo);
			return;
		}
		
		// Setup WebGL renderer
        renderer = new WebGLRenderer( { antialias: true } );
		
        renderer.sortObjects = false;
		renderer.autoClear = false;
		renderer.setClearColor(new Color(0x000000));
		renderer.setPixelRatio(Browser.window.devicePixelRatio);
		
		// Attach game div
		var gameAttachPoint = Browser.document.getElementById("game");
		gameAttachPoint.appendChild(gameDiv);
		
		// Add credits
		var container = Browser.document.createElement('div');
		Browser.document.body.appendChild(container);
		var info = Browser.document.createElement('div');
		info.style.position = 'absolute';
		info.style.top = '20px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		info.style.color = 'white';
		info.innerHTML = '<a href="' + REPO_URL + '" target="_blank">' + REPO_NAME + '</a> by <a href="' + WEBSITE_URL + '" target="_blank">Sam Twidale</a>.';
		container.appendChild(info);
		
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		// Scene setup
		scene = new Scene();
		
		// Camera setup
		monoCamera = new PerspectiveCamera(60, width / height, 2.0, 10000.0);
		monoCamera.position.set(0, 0, 10);
		untyped monoCamera.focalLength = 10;
		
		stereoCamera = new StereoCamera();
		
		// Initial scene setup
		var sphere = new SphereBufferGeometry(32, 32, 16);
		var plane = new PlaneBufferGeometry(10, 10, 1, 1);
		var material = new MeshBasicMaterial( { color: 0xBBBBBB } );
		
		var zeroPlane = new Mesh(plane, material);
		zeroPlane.position.set(-5, 5, 0);
		scene.add(zeroPlane);
		
		for (i in 0...20) {
			var mesh = new Mesh(sphere, material);
			mesh.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, -200 - Math.random() * 500);
			scene.add(mesh);
		}
		
		// Setup effects
		effect = Effect.ANAGLYPH;
		
		anaglyphEffect = new AnaglyphEffect(renderer, stereoCamera, width, height);
		anaglyphEffect.setSize(width, height);
		
		toeInEffect = new ToeInEffect(renderer, stereoCamera, width, height);
		toeInEffect.setSize(width, height);
		
		symmetricStereoEffect = new SymmetricStereoEffect(renderer, stereoCamera, width, height);
		symmetricStereoEffect.setSize(width, height);
		
		asymmetricStereoEffect = new AsymmetricStereoEffect(renderer, stereoCamera, width, height);
		asymmetricStereoEffect.setSize(width, height);
		
		// Initial renderer setup
		onResize();
		
		// Event setup
		// Window resize event
		Browser.window.addEventListener("resize", function():Void {
			onResize();
		}, true);
		
		// Disable context menu opening
		Browser.window.addEventListener("contextmenu", function(event) {
			event.preventDefault();
		}, true);
		
		// Add characters on keypress
		Browser.window.addEventListener("keypress", function(event) {
			event.preventDefault();
		}, true);
		
		// Remove characters on delete/backspace
		Browser.window.addEventListener("keydown", function(event) {
			event.preventDefault();
		}, true);
		
		var onMouseWheel = function(event) {
			event.preventDefault();
		}
		
		// Zoom in or out manually
		Browser.document.addEventListener("mousewheel", onMouseWheel, false);
		Browser.document.addEventListener("DOMMouseScroll", onMouseWheel, false);
		
		// Onscreen debug controls
		setupGUI();
		
		#if debug
		// Setup performance stats
		setupStats();
		#end
		
		// Present game and start animation loop
		gameDiv.appendChild(renderer.domElement);
		Browser.window.requestAnimationFrame(animate);
	}
	
	// Called when browser window resizes
	private function onResize():Void {
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		renderer.setSize(Browser.window.innerWidth, Browser.window.innerHeight);
		
		anaglyphEffect.setSize(width, height);
		
		monoCamera.aspect = width / height;
		monoCamera.updateProjectionMatrix();
	}
	
	private function animate(time:Float):Void {
		#if debug
		stats.begin();
		#end
		
		dt = (time - lastAnimationTime) * 0.001; // Seconds
		lastAnimationTime = time;
		
		switch(effect) {
			case ANAGLYPH:
				anaglyphEffect.render(scene, monoCamera);
			case TOE_IN:
				toeInEffect.render(scene, monoCamera);
			case SYMMETRIC_STEREO:
				symmetricStereoEffect.render(scene, monoCamera);
			case ASYMMETRIC_STEREO:
				asymmetricStereoEffect.render(scene, monoCamera);
		}
		
		Browser.window.requestAnimationFrame(animate);
		
		#if debug
		stats.end();
		#end
	}
	
	private inline function setupGUI():Void {
		shaderGUI.add(this, 'effect', {
			Anaglyph: ANAGLYPH,
			Toein: TOE_IN,
			Symmetric: SYMMETRIC_STEREO,
			Asymmetric: ASYMMETRIC_STEREO
		}).listen();
		
		ThreeObjectGUI.addItem(shaderGUI, monoCamera, "Mono Camera");
		ThreeObjectGUI.addItem(shaderGUI, stereoCamera, "Stereo Camera");
		ThreeObjectGUI.addItem(shaderGUI, stereoCamera.cameraL, "Stereo Camera Left");
		ThreeObjectGUI.addItem(shaderGUI, stereoCamera.cameraR, "Stereo Camera Right");
		
		//ThreeObjectGUI.addItem(shaderGUI, scene, "Scene");
		
		ShaderGUI.generate(shaderGUI, "Anaglyph", anaglyphEffect.material.uniforms);
		ShaderGUI.generate(shaderGUI, "Toe-in", toeInEffect.material.uniforms);
		ShaderGUI.generate(shaderGUI, "Symmetric", symmetricStereoEffect.material.uniforms);
		ShaderGUI.generate(shaderGUI, "Asymmetric", asymmetricStereoEffect.material.uniforms);
	}
	
	#if debug
	private inline function setupStats(mode:Mode = Mode.MEM):Void {
		Sure.sure(stats == null);
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		Browser.window.document.body.appendChild(stats.domElement);
	}
	#end
}