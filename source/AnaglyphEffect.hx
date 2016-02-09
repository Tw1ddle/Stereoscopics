package;

import shaders.Anaglyph;
import three.Mesh;
import three.OrthographicCamera;
import three.PerspectiveCamera;
import three.PixelFormat;
import three.PlaneBufferGeometry;
import three.Scene;
import three.ShaderMaterial;
import three.StereoCamera;
import three.TextureFilter;
import three.WebGLRenderer;
import three.WebGLRenderTarget;
import three.WebGLRenderTargetOptions;

class AnaglyphEffect {
	private var camera:OrthographicCamera;
	private var scene:Scene;
	public var stereo(default,null):StereoCamera;
	private var params:WebGLRenderTargetOptions;
	private var left:WebGLRenderTarget;
	private var right:WebGLRenderTarget;
	public var material(default, null):ShaderMaterial;
	private var renderer:WebGLRenderer;
	
	public function new(renderer:WebGLRenderer, width:Float, height:Float) {
		this.renderer = renderer;
		camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
		scene = new Scene();
		stereo = new StereoCamera();
		params = { minFilter: TextureFilter.LinearFilter, magFilter: TextureFilter.NearestFilter, format: cast PixelFormat.RGBAFormat };
		left = new WebGLRenderTarget(width, height, params);
		right = new WebGLRenderTarget(width, height, params);
		material = new ShaderMaterial( {
			vertexShader: Anaglyph.vertexShader,
			fragmentShader: Anaglyph.fragmentShader,
			uniforms: Anaglyph.uniforms
		});
		material.uniforms.tLeft.value = left;
		material.uniforms.tRight.value = right;
		material.uniforms.type.value = AnaglyphType.RED_CYAN;
		
		var mesh = new Mesh(new PlaneBufferGeometry(2, 2), material);
		scene.add(mesh);
	}
	
	public function setSize(width:Float, height:Float):Void {
		left.setSize(width, height);
		right.setSize(width, height);
		renderer.setSize(width, height);
	}
	
	public function render(scene:Scene, camera:PerspectiveCamera):Void {
		scene.updateMatrixWorld(true);
		
		if (camera.parent == null) {
			camera.updateMatrixWorld(true);
		}
		
		stereo.update(camera);
		
		renderer.render(scene, stereo.cameraL, left, true);
		renderer.render(scene, stereo.cameraR, right, true);
		renderer.render(this.scene, this.camera);
	}
}