/* ----------------------------------------------------------------------------
 * basic shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec2 resolution;
uniform bool isMono;
varying vec4 vColor;
varying float vFog;
varying float vLight;
const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3 monochrome = vec3(redScale, greenScale, blueScale);
void main(){
    vec2 p = ((gl_FragCoord.xy / resolution) - 0.5) * 2.0;
    float l = 1.0 - min(length(p), 1.0);
    vec4 c = vec4(vec3(l), 1.0) * vec4(vec3(vFog * vLight), 1.0);
    vec4 destColor = vColor * c;
    if(isMono){destColor = vec4(vec3(dot(destColor.rgb, monochrome)), destColor.a);}
    gl_FragColor = destColor;
}
