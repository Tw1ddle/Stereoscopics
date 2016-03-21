package shaders;

import util.FileReader;

class SymmetricStereo {
	public static var uniforms = {
		tLeft: { type: "t", value: null },
		tRight: { type: "t", value: null }
	};
	public static var vertexShader = FileReader.readFile("source/shaders/passthrough.vertex");
	public static var fragmentShader = FileReader.readFile("source/shaders/symmetric.fragment");
}