/* eslint-disable import/no-anonymous-default-export */
export default /* glsl */`

varying vec3 vNormal; // not precisely in the original context raw 3d, but useful nevertheless
varying vec3 vPosition;
varying vec2 vUv;

void main()	{

    vPosition = position;
    vUv = uv;
    vNormal = normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;