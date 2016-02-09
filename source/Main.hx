package;

import AnaglyphEffect;
import dat.GUI;
import dat.ShaderGUI;
import dat.ThreeObjectGUI;
import js.Browser;
import stats.Stats;
import three.Color;
import three.Mesh;
import three.MeshBasicMaterial;
import three.PerspectiveCamera;
import three.Scene;
import three.SphereBufferGeometry;
import three.WebGLRenderer;
import webgl.Detector;
import three.PlaneBufferGeometry;

class Main {
	public static inline var REPO_URL:String = "https://github.com/Tw1ddle/Stereoscopics";
	public static inline var WEBSITE_URL:String = "http://samcodes.co.uk/";
	public static inline var TWITTER_URL:String = "https://twitter.com/Sam_Twidale";
	public static inline var HAXE_URL:String = "http://haxe.org/";
	
	private var loaded:Bool = false;
	
	private var renderer:WebGLRenderer;
	//private var composer:EffectComposer;
	//private var aaPass:ShaderPass;
	
	private var scene:Scene;
	private var camera:PerspectiveCamera;
	
	// TODO implement more effects
	private var anaglyphEffect:AnaglyphEffect;
	
	private static var lastAnimationTime:Float = 0.0; // Last time from requestAnimationFrame
	private static var dt:Float = 0.0; // Frame delta time
	
	#if debug
	private var sceneGUI:GUI = new GUI( { autoPlace:true } );
	private var shaderGUI:GUI = new GUI( { autoPlace:true } );
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
		info.innerHTML = '<a href="https://github.com/Tw1ddle/Stereoscopics" target="_blank">Stereoscopics</a> by <a href="http://www.samcodes.co.uk/" target="_blank">Sam Twidale</a>.';
		container.appendChild(info);
		
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		scene = new Scene();
		camera = new PerspectiveCamera(60, width / height, 2.0, 10000.0);
		camera.position.set(0, 0, 10);
		untyped camera.focalLength = 10;
		
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
		
		// Setup composer passes
		anaglyphEffect = new AnaglyphEffect(renderer, width, height);
		anaglyphEffect.setSize(width , height);
		
		//composer = new EffectComposer(renderer);
		
		//var renderPass = new RenderPass(scene, camera);
		
		//aaPass = new ShaderPass( { vertexShader: FXAA.vertexShader, fragmentShader: FXAA.fragmentShader, uniforms: FXAA.uniforms } );
		//aaPass.renderToScreen = true;
		//aaPass.uniforms.resolution.value.set(width, height);
		
		//composer.addPass(renderPass);
		//composer.addPass(aaPass);
		
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
		
		#if debug
		// Setup performance stats
		setupStats();
		
		// Onscreen debug controls
		setupGUI();
		#end
		
		// Present game and start animation loop
		loaded = true;
		gameDiv.appendChild(renderer.domElement);
		Browser.window.requestAnimationFrame(animate);
	}
	
	// Called when browser window resizes
	private function onResize():Void {
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		renderer.setSize(Browser.window.innerWidth, Browser.window.innerHeight);
		
		anaglyphEffect.setSize(width, height);
		//composer.setSize(width, height);
		//aaPass.uniforms.resolution.value.set(width, height);
		
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
	
	private function animate(time:Float):Void {
		#if debug
		stats.begin();
		#end
		
		dt = (time - lastAnimationTime) * 0.001; // Seconds
		lastAnimationTime = time;
		
		//composer.render(dt);
		anaglyphEffect.render(scene, camera);
		
		Browser.window.requestAnimationFrame(animate);
		
		#if debug
		stats.end();
		#end
	}
	
	#if debug
	private inline function setupGUI():Void {
		ThreeObjectGUI.addItem(sceneGUI, camera, "World Camera");
		ThreeObjectGUI.addItem(sceneGUI, anaglyphEffect.stereo, "Stereo Camera");
		ThreeObjectGUI.addItem(sceneGUI, anaglyphEffect.stereo.cameraL, "Stereo Camera Left");
		ThreeObjectGUI.addItem(sceneGUI, anaglyphEffect.stereo.cameraR, "Stereo Camera Right");
		
		ThreeObjectGUI.addItem(sceneGUI, scene, "Scene");
		
		ShaderGUI.generate(shaderGUI, "Anaglyph", anaglyphEffect.material.uniforms);
	}
	
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