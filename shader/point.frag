/* ----------------------------------------------------------------------------
 * point shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec4 globalColor;
varying float vFog;
void main(){
    gl_FragColor = vec4(vec3(vFog), 1.0) * globalColor;
}
