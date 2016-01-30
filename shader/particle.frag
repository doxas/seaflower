/* ----------------------------------------------------------------------------
 * particle shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec4 globalColor;
uniform sampler2D texture;
varying float vDepth;
void main(){
    gl_FragColor = texture2D(texture, gl_PointCoord.st) * vec4(globalColor.rgb, globalColor.a * vDepth);
}
