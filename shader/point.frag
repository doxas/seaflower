/* ----------------------------------------------------------------------------
 * point shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec4 globalColor;
uniform sampler2D texture;
varying float vFog;
void main(){
    vec4 color = vec4(vec3(vFog), 1.0) * globalColor;
    gl_FragColor = texture2D(texture, gl_PointCoord.st) * color;
    gl_FragColor = color;
}
