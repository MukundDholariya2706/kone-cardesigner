
import TrowbridgeReitzFalloff from './trowbridge-reitz-falloff.glsl'
/* eslint-disable import/no-anonymous-default-export */
export default /* glsl */`
#define PI 3.141592653589793

//precision mediump float;
//precision mediump int;

uniform samplerCube cubemap;

uniform bool filterR;
uniform bool filterG;
uniform bool filterB;

uniform float roughness;

varying vec2 vUv;
varying vec3 vPosition;

uniform int maxMIPLevel;

${TrowbridgeReitzFalloff}

// use this to view a cubemap on a plane
void main() {

    vec4 cubeColorSample;
    if (maxMIPLevel > 0){
        float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );
        cubeColorSample = textureLod( cubemap, normalize(vPosition), specularMIPLevel );
    } else {
        cubeColorSample = textureCube( cubemap, normalize(vPosition) );    
    }

    if (filterR){
        cubeColorSample.r = 0.0;
    }

    if (filterG){
        cubeColorSample.g = 0.0;
    }

    if (filterB){
        cubeColorSample.b = 0.0;
    }
    
    gl_FragColor = cubeColorSample;
    
    //vec4 debugSample = vec4(normalize(vPosition), 1.0);
    //gl_FragColor = debugSample;

}
`;