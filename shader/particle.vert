attribute vec3 position;
attribute vec4 wave;
uniform mat4 mvpMatrix;
uniform float time;
uniform float depthRange;
uniform float pointSize;
varying float vDepth;
void main(){
    float xzSin = sin(wave.x * time) * wave.z;
    float xzCos = cos(wave.x * time) * wave.z;
    float ySin  = sin(wave.y * time) * wave.w;
    float d = (position.z + depthRange) / depthRange * 2.0;
    gl_Position = mvpMatrix * vec4(position + vec3(xzSin, ySin, xzCos), 1.0);
    gl_PointSize = d * pointSize;
    vDepth = (1.2 - abs(d - 0.5) * 2.0) * 0.7;
}
