/* ----------------------------------------------------------------------------
 * gpgpu first shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform float size;
uniform int mode;
float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}
void main(){
    float r = 0.0; float g = 0.0; float b = 0.0; float a = 0.0;
    vec3 p = vec3(0.0); vec3 q = vec3(0.0); vec3 s = vec3(0.0); vec3 t = vec3(0.0);
    vec4 destColor = vec4(0.0);
    p = normalize(vec3(
        rnd(gl_FragCoord.xx),
        rnd(gl_FragCoord.xy),
        rnd(gl_FragCoord.yy)
    ));
    q = normalize(vec3(
        rnd(gl_FragCoord.xy),
        rnd(gl_FragCoord.yx),
        rnd(gl_FragCoord.xx)
    ));
    s = vec3(q.x, p.y, p.x * q.y);
    t = vec3(q.z, p.x, p.z * q.x);
    a = rnd(gl_FragCoord.xy);
    if(mode == 0){
        // velocity and speed
        destColor = vec4(normalize(p * q * s * t), a);
    }else if(mode == 1){
        // position and param
        destColor = vec4(normalize(p + q + s + t) * (a + size), a);
    }
    gl_FragColor = destColor;
}
