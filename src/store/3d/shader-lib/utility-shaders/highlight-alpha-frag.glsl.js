/* eslint-disable import/no-anonymous-default-export */
export default /* glsl */`

uniform sampler2D baseTexture;

varying vec2 vUv;

// use this to highlight if the base has sent alpha.
void main() {

    vec4 noAlphaColor = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 fullAlphaColor = vec4(1.0, 1.0, 1.0, 1.0);
    float alphaValue = texture2D( baseTexture, vUv ).a;
    vec4 baseColor = mix(noAlphaColor, fullAlphaColor, alphaValue);
    gl_FragColor = baseColor;

}
`;