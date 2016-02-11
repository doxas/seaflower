attribute vec3 position;
attribute vec3 normal;
attribute vec3 iPosition;
attribute vec4 iColor;
attribute vec4 iFlag;
uniform mat4 mvpMatrix;
uniform vec4 globalColor;
varying vec4 vColor;
void main(){
    vec3 n = normal;
    gl_Position = mvpMatrix * vec4(position + iPosition, 1.0);
    vColor = vec4(iColor.rgb, iFlag.x) * globalColor;
}
