attribute vec3 position;
attribute vec3 normal;
attribute vec3 disc;
attribute vec4 color;
attribute vec3 iPosition;
attribute vec4 iColor;
attribute vec4 iFlag;
uniform mat4 rMatrix;
uniform mat4 mMatrix;
uniform mat4 mvpMatrix;
uniform vec3 eyePosition;
uniform float time;
uniform int mode;
uniform vec4 globalColor;
varying vec4 vColor;
varying float vFog;
const float start = 0.0;
const float end = 80.0;
#define PI 3.14159265358
#define DEG 1.5707963267
float fog(float v){
    float f = smoothstep(start, end, v);
    return (sin(f * PI * 2.0 - DEG) + 1.0) * 0.5;
}
void main(){
    vec3 q = vec3(0.0);
    if(mode == 0){
        if(time > 0.0){
            float y = sin(time * (iFlag.x + 1.0) * 0.5);
            float s = (y + 1.0) * 0.5;
            float d = s * disc.z * 5.0 * (1.0 + iFlag.y);
            q = position + vec3(disc.x, 0.5 - y, disc.y) * vec3(d, disc.z * 2.0, d);
        }
    }else{
        if(time > 0.0){
            float t = time * (iFlag.x + 1.0) * 5.0;
            float si = sin(t * disc.y);
            float co = cos(t * disc.y);
            float bl = sin((iFlag.y + 1.0) * time) * 2.0 * iFlag.z * disc.y;
            mat2 m = mat2(co, si, -si, co);
            vec2 v = m * position.xz;
            q = vec3(v.x, position.y + bl, v.y);
        }
    }
    vec3 n = normal;
    vec3 p = (rMatrix * vec4(q, 1.0)).xyz + iPosition;
    gl_Position = mvpMatrix * vec4(p, 1.0);
    gl_PointSize = 1.0;
    vColor = vec4(iColor.rgb, 1.0) * globalColor * color;
    vec4 model = mMatrix * vec4(p, 1.0);
    vFog = fog(length(model.xyz - eyePosition));
}
