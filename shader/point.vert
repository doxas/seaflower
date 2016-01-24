attribute vec3 position;
attribute vec2 texCoord;
uniform mat4 mvpMatrix;
uniform sampler2D vertTexture;
void main(){
    float h = texture2D(vertTexture, texCoord).r * 2.0 - 1.0;
    gl_Position = mvpMatrix * vec4(position + vec3(0.0, h, 0.0), 1.0);
    gl_PointSize = 1.0;
}
