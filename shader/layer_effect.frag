/* ----------------------------------------------------------------------------
 * layer effect shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform int mode;
uniform float resolution;
uniform vec4 firstColor;
uniform vec4 secondColor;
void main(){
    float f = 0.0;
    vec2 p = gl_FragCoord.xy / resolution;
    vec2 q = p * 2.0 - 1.0;
    vec2 r = vec2(0.0);
    vec4 destColor = vec4(1.0);
    if(mode == 0){
        f = length(q) * 0.75;
        destColor = mix(firstColor, secondColor, f);
    }else if(mode == 1){
        f = length(vec2(q.x, 1.0 - p.y)) * 0.5;
        destColor = mix(firstColor, secondColor, f);
    }else if(mode == 2){
        f = (1.0 - p.y) * 0.5;
        destColor = mix(firstColor, secondColor, f);
    }
    gl_FragColor = destColor;
}
