/* ----------------------------------------------------------------------------
 * gpgpu render shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec4 globalColor;
uniform sampler2D texture;
void main(){
    vec4 smpColor = texture2D(texture, gl_PointCoord.st);
    gl_FragColor = smpColor * globalColor;
}
