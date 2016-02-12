attribute vec3 position;
attribute vec3 normal;
attribute vec3 iPosition;
attribute vec4 iColor;
attribute vec4 iFlag;
uniform mat4 mMatrix;
uniform mat4 mvpMatrix;
uniform vec3 eyePosition;
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
    vec3 n = normal;
    gl_Position = mvpMatrix * vec4(position + iPosition, 1.0);
    gl_PointSize = 1.0;
    vColor = vec4(iColor.rgb * iFlag.x, 1.0) * globalColor;
    vec4 model = mMatrix * vec4(position + iPosition, 1.0);
    vFog = fog(length(model.xyz - eyePosition));
}
