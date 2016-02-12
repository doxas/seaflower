/* ----------------------------------------------------------------------------
 * basic shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec2 resolution;
varying vec4 vColor;
varying float vFog;
void main(){
    vec2 p = ((gl_FragCoord.xy / resolution) - 0.5) * 2.0;
    float l = 1.0 - min(length(p), 1.0);
    vec4 c = vec4(vec3(l), 1.0) * vec4(vec3(vFog), 1.0);
    gl_FragColor = vColor * c;
}
