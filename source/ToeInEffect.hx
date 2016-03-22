package;

import js.Browser;
import three.PerspectiveCamera;
import three.Scene;
import three.StereoCamera;
import three.WebGLRenderer;

// TODO
class ToeInEffect {
	private var stereo:StereoCamera;
	private var renderer:WebGLRenderer;
	
	public function new(renderer:WebGLRenderer, stereoCamera:StereoCamera, width:Float, height:Float) {
		this.renderer = renderer;
		this.stereo = stereoCamera;
	}
	
	public function setSize(width:Float, height:Float):Void {
		renderer.setSize(width, height);
	}
	
	public function render(scene:Scene, camera:PerspectiveCamera):Void {
		scene.updateMatrixWorld(true);
		
		if (camera.parent == null) {
			camera.updateMatrixWorld(true);
		}
		
		stereo.update(camera);
		
		var width = Browser.window.innerWidth; // TODO why not PixelRatio? * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		renderer.enableScissorTest(true);
		renderer.clear();
		
		renderer.setScissor(0, 0, width / 2, height);
		renderer.setViewport(0, 0, width / 2, height);
		renderer.render(scene, stereo.cameraL);
		
		renderer.setScissor(width / 2, 0, width / 2, height);
		renderer.setViewport(width / 2, 0, width / 2, height);
		renderer.render(scene, stereo.cameraR);
		
		renderer.setViewport(width, height);
		renderer.enableScissorTest(false);
	}
}