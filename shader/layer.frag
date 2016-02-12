/* ----------------------------------------------------------------------------
 * layer shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec4 globalColor;
varying vec2 vTexCoord;
void main(){
    gl_FragColor = globalColor;
}
