// eslint-disable-next-line import/no-anonymous-default-export
export default /* glsl */`

// Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {

    float maxMIPLevelScalar = float( maxMIPLevel );

    float sigma = PI * roughness * roughness / ( 1.0 + roughness );
    float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

    
    // clamp to allowable LOD ranges.
    return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}
`;