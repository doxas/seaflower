/* ----------------------------------------------------------------------------
 * final shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec4 globalColor;
uniform sampler2D texture;
uniform sampler2D noise;
uniform int mode;
uniform float time;
varying vec2 vTexCoord;
const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3 gray = vec3(redScale, greenScale, blueScale);
#define PI 3.14159265358
#define PI2 6.28318530716
void main(){
    vec4 destColor = texture2D(texture, vTexCoord) * globalColor;
    if(mode == 1){
        destColor = vec4(vec3(dot(destColor.rgb, gray)), 1.0);
    }else if(mode == 2){
        vec2 p = (vTexCoord - 0.5) * 2.0;
        float l = min(length(p), 1.25) * 0.8;
        float u = (atan(p.y, p.x) + PI) / PI2;
        float n = texture2D(noise, vec2(u, mod(time * 0.2, 1.0))).r;
        destColor = vec4(vec3(pow(n + 0.3, 5.0) * l), 1.0) * globalColor;
    }
    gl_FragColor = destColor;
}
