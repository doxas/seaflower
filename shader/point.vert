attribute vec3 position;
attribute vec2 texCoord;
uniform mat4 mMatrix;
uniform mat4 mvpMatrix;
uniform vec3 eyePosition;
uniform sampler2D vertTexture;
uniform float height;
uniform float time;
varying float vFog;
const float start = 0.0;
const float end = 60.0;
#define PI 3.14159265358
#define DEG 1.5707963267
float fog(float v){
    float f = smoothstep(start, end, v);
    return (sin(f * PI * 2.0 - DEG) + 1.0) * 0.5;
}
void main(){
    float h = texture2D(vertTexture, mod(texCoord + time, 1.0)).r * 2.0 - 1.0;
    gl_Position = mvpMatrix * vec4(position + vec3(0.0, h * height, 0.0), 1.0);
    gl_PointSize = 1.0;
    vec4 model = mMatrix * vec4(position, 1.0);
    vFog = fog(length(model.xyz - eyePosition));
}
