attribute vec3 position;
attribute vec2 texCoord;
uniform mat4 mvpMatrix;
uniform sampler2D vertTexture;
uniform float time;
void main(){
    float h = texture2D(vertTexture, mod(texCoord + time * 0.1, 1.0)).r * 2.0 - 1.0;
    gl_Position = mvpMatrix * vec4(position + vec3(0.0, h, 0.0), 1.0);
    gl_PointSize = 4.0;
}
