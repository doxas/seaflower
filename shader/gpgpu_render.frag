/* ----------------------------------------------------------------------------
 * gpgpu render shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec4 globalColor;
void main(){
    gl_FragColor = globalColor;
}
