/* ----------------------------------------------------------------------------
 * gpgpu update shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform int mode;
uniform float resolution;
uniform vec3 target;
uniform float power;
uniform float speed;
uniform sampler2D velocityTexture;
uniform sampler2D positionTexture;
void main(){
    vec3 v = vec3(0.0);
    vec4 destColor = vec4(0.0);
    vec2 p = gl_FragCoord.xy / resolution;
    vec4 vel = texture2D(velocityTexture, p);
    vec4 pos = texture2D(positionTexture, p);
    if(mode == 0){
        v = normalize(normalize(target - pos.xyz) * power + vel.xyz);
        destColor = vec4(v, vel.w);
    }else if(mode == 1){
        destColor = vec4(pos.xyz + vel.xyz * speed, pos.w);
    }
    gl_FragColor = destColor;
}
