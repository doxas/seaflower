/* ----------------------------------------------------------------------------
 * point shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec4 globalColor;
uniform sampler2D texture;
void main(){
    gl_FragColor = texture2D(texture, gl_PointCoord.st) * globalColor;
}
