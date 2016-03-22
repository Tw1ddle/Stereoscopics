package;

import js.Browser;
import three.PerspectiveCamera;
import three.Scene;
import three.Vector3;
import three.WebGLRenderer;

// TODO
class AsymmetricStereoEffect {
	private var renderer:WebGLRenderer;
	
	public function new(renderer:WebGLRenderer, width:Float, height:Float) {
		this.renderer = renderer;
	}
	
	public function setSize(width:Float, height:Float):Void {
		renderer.setSize(width, height);
	}
	
	public function render(scene:Scene, camera:PerspectiveCamera):Void {
		scene.updateMatrixWorld(true);
		
		if (camera.parent == null) {
			camera.updateMatrixWorld(true);
		}
		
		// TODO
		/*
		var width = Browser.window.innerWidth; // TODO why not PixelRatio? * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		var eyeSep = 10.0;
		
		var apertureRads = camera.near * Math.tan(camera.fov / 2);
		var right = camera.getWorldDirection().cross(camera.up);
		right = right.multiply(new Vector3(eyeSep / 2.0));
		
		var top = apertureRads;
		var bottom = -apertureRads;
		var left = -camera.aspect * apertureRads - 0.5 * eyeSep * camera.near / camera.far;
		var right = camera.aspect * apertureRads - 0.5 * eyeSep * camera.near / camera.far;
		
		camera.position.set(camera.position.x - cameraRight.
		camera.lookAt(new Vector3(camera.position.x + right.x, 
		*/
	}
}