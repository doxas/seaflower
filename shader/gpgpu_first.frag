/* ----------------------------------------------------------------------------
 * gpgpu first shader
 * ---------------------------------------------------------------------------- */
precision highp float;
uniform float size;
uniform int mode;
#define PI 3.14159265358
#define PI2 6.28318530716
#define PIH 1.57079632679
float hash(vec2 n){
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float rnd(vec2 n){
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(hash(b), hash(b + d.yx), f.x), mix(hash(b + d.xy), hash(b + d.yy), f.x), f.y);
}
void main(){
    float a = 0.0;
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
    a = rnd(gl_FragCoord.yx);
    if(mode == 0){
        // velocity and speed
        destColor = vec4(p, a);
    }else if(mode == 1){
        // position and param
        destColor = vec4(p * (a * size), a);
    }else if(mode == 2){
        // position and param
        destColor = vec4(normalize(p + vec3(0.0, 0.0, -1.0)), a);
    }else if(mode == 3){
        // position (XY scale version) and param
        destColor = vec4(p * (a * size) * vec3(0.1, 0.1, 2.0), a);
    }
    gl_FragColor = destColor;
}
