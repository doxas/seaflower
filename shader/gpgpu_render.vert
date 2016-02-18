attribute float index;
uniform mat4 mvpMatrix;
uniform float resolution;
uniform float pointScale;
uniform sampler2D positionTexture;
void main(){
    vec3 q = vec3(0.0);
    vec2 p = vec2(
        mod(index, resolution) / resolution,
        floor(index / resolution) / resolution
    );
    vec4 t = texture2D(positionTexture, p);
    gl_Position  = mvpMatrix * vec4(t.xyz, 1.0);
    gl_PointSize = 0.1 + t.w * pointScale;
}
