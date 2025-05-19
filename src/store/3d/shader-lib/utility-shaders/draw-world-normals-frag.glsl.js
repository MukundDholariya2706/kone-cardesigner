/* eslint-disable import/no-anonymous-default-export */
export default /* glsl */`

varying vec3 vNormal;

// use this to show and capture world normals for plain normalmapping
void main() {

    //vec3 normalVector = mix(noAlphaColor, fullAlphaColor, alphaValue);
    vec3 normal = vNormal;
    #ifdef FLIP_SIDED
        normal = -normal;
    #endif
    vec3 adjustedNormal = (normal * 0.5) + 0.5;
    
    gl_FragColor = vec4(adjustedNormal, 1.0);
}
`;