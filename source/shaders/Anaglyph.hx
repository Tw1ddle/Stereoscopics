package shaders;

import util.FileReader;

@:enum abstract AnaglyphType(Int) from Int to Int {
	var RED_CYAN = 0;
}

class Anaglyph {
	public static var uniforms = {
		tLeft: { type: "t", value: null },
		tRight: { type: "t", value: null },
		type: { type: "i", value: 0 }
	};
	public static var vertexShader = FileReader.readFile("source/shaders/passthrough.vertex");
	public static var fragmentShader = FileReader.readFile("source/shaders/anaglyph.fragment");
}