package;

import js.Browser;
import three.PerspectiveCamera;
import three.Scene;
import three.WebGLRenderer;
import three.Vector3;

class ToeInEffect {
	private var renderer:WebGLRenderer;
	
	public function new(renderer:WebGLRenderer, width:Float, height:Float) {
		this.renderer = renderer;
	}
	
	public function setSize(width:Float, height:Float):Void {
		renderer.setSize(width, height);
	}
	
	public function render(scene:Scene, camera:PerspectiveCamera, eyeSeparation:Float):Void {
		scene.updateMatrixWorld(true);
		
		if (camera.parent == null) {
			camera.updateMatrixWorld(true);
		}
		
		var width = Browser.window.innerWidth; // TODO why not PixelRatio? * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		renderer.enableScissorTest(true);
		renderer.clear();
		
		var p = camera.position.clone();
		
		renderer.setScissor(0, 0, width / 2, height);
		renderer.setViewport(0, 0, width / 2, height);
		camera.position.set(p.x + eyeSeparation / 2.0, p.y, p.z);
		camera.lookAt(new Vector3(0, 0, 0));
		renderer.render(scene, camera);
		
		renderer.setScissor(width / 2, 0, width / 2, height);
		renderer.setViewport(width / 2, 0, width / 2, height);
		camera.position.set(p.x - eyeSeparation / 2.0, p.y, p.z);
		camera.lookAt(new Vector3(0, 0, 0));
		renderer.render(scene, camera);
		
		camera.position.set(p.x, p.y, p.z);
		
		renderer.setViewport(width, height);
		renderer.enableScissorTest(false);
	}
}