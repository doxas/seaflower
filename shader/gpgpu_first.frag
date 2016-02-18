/* ----------------------------------------------------------------------------
 * gpgpu first shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform float size;
uniform int mode;
#define PI 3.14159265358
#define PI2 6.28318530716
#define PIH 1.57079632679
float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}
void main(){
    float r = 0.0; float g = 0.0; float b = 0.0; float a = 0.0;
    vec3 p = vec3(0.0);
    vec4 destColor = vec4(0.0);
    float i = rnd(gl_FragCoord.xx);
    float j = rnd(gl_FragCoord.xy);
    float k = rnd(gl_FragCoord.yy);
    float tr = cos(PIH + i * PI);
    float tx = sin(j * PI2) * tr;
    float ty = sin(PIH + i * PI);
    float tz = cos(k * PI2) * tr;
    p = normalize(vec3(tx, ty, tz));
    a = rnd(gl_FragCoord.xy);
    if(mode == 0){
        // velocity and speed
        destColor = vec4(p, a);
    }else if(mode == 1){
        // position and param
        destColor = vec4(p * (a + size), a);
    }
    gl_FragColor = destColor;
}
