/* eslint-disable import/no-anonymous-default-export */
export default /* glsl */`
#define STANDARD
// this is a basic shader for showing occlusion and shadow

varying vec3 vNormal; 
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

varying vec2 mapUv;
uniform mat3 mapUvTransform;

varying vec2 alphaMapUv;
uniform mat3 alphaMapUvTransform;

varying vec2 emissiveMapUv;
uniform mat3 emissiveMapUvTransform;

attribute vec2 uv2;
varying vec2 vUv2;
uniform mat3 uv2Transform;

uniform bool uv2AlphaMap;

void main()	{

	// copied from regular shader
	vec3 transformed = vec3(position);
	vec4 mvPosition = vec4( transformed, 1.0 );
	vec4 worldPosition = vec4( transformed, 1.0 );
	worldPosition = modelMatrix * worldPosition;
	vWorldPosition = worldPosition.xyz;

    vPosition = position;
    vUv = uv;
    vNormal = normal;

    /*
	if (uv2AlphaMap){
		alphaMapUv = ( alphaMapUvTransform * vec3( uv2, 1 ) ).xy;
	} else {
		alphaMapUv = ( alphaMapUvTransform * vec3( uv, 1 ) ).xy;
	}
    */

    if (uv2AlphaMap){
		alphaMapUv = ( vec3( uv2, 1 ) ).xy;
	} else {
		alphaMapUv = ( vec3( uv, 1 ) ).xy;
	}

	mapUv = ( vec3( uv, 1 ) ).xy;
    emissiveMapUv = ( vec3( uv, 1 ) ).xy;
	//vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;