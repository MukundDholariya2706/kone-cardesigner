/* eslint-disable import/no-anonymous-default-export */

// add some color to the albedo based on the dot product

export default /* glsl */`
if (iridescent){
  // this might actually be calculated already in some scenarios, but I'm not going to change the whole source for a "might"
  vec3 worldNorm = inverseTransformDirection(vNormal.xyz, viewMatrix);
  vec3 worldViewDir = inverseTransformDirection(vViewPosition.xyz, viewMatrix);
  float iridescenceDot = dot(worldViewDir, worldNorm);
  // this is not completely neccessary if we are using a wrapping texture
  float texCoord = 1.0 - iridescenceDot;

  // not efficient but wanted to experiment, using r value as brightness
  // we most likely have a lightmap available anyway so resampling is kind of inefficient
  // vec4 iridescentLightmapTexel = texture2D( lightMap, vUv2 );
  // texCoord -= max(max(iridescentLightmapTexel.r, 0.5) - 0.5, 0.0);

  // it seems that the threejs linear sampling with wrap goes around
  // I think that this could be left out and ensure that the texture settings are using clamp
  texCoord = clamp(texCoord, 0.001, 1.0); 
  // vec3 iridescenceSample = saturate(mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), texCoord));
  vec3 iridescenceSample = texture2D( map, vec2(texCoord, 0.0) ).xyz;
  
  diffuseColor.rgb = iridescenceSample;
}
`;