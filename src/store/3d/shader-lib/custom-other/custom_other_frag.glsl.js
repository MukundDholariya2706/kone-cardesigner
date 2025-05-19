/* eslint-disable import/no-anonymous-default-export */
export default /* glsl */`

varying vec3 vNormal; 
varying vec3 vPosition;
varying vec3 vWorldPosition;

uniform sampler2D alphaMap;
uniform float opacity;

uniform vec3 color;
uniform sampler2D colorMap;

uniform sampler2D emissiveMap;
uniform vec3 emissive;
uniform float emissiveIntensity;
uniform float bloomIntensity;

varying vec2 mapUv;
varying vec2 alphaMapUv;
varying vec2 emissiveMapUv;

uniform bool emissionOnly;
uniform bool normalOnly;
uniform bool opacityToR;
uniform bool hide;

uniform bool useTriplanarMapping;
uniform vec2 triplanarMappingScale;

vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {
	// matrix is assumed to be orthogonal
	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );
}


vec4 triplanar_mapping( sampler2D texInput, vec3 normal, vec3 position, vec2 scale ) {

    vec3 bf = normalize( abs( normal ) );
    bf /= dot( bf, vec3( 1.0 ) );

    // scale = 1.0 / scale; // tested this because scale didn't work at one point
    vec2 tx;
    vec2 tz;
    tx = vec2(position.z * scale.x, position.y * scale.y);
    tz = vec2(position.x * scale.x, position.y * scale.y);
    
    vec2 ty = vec2(position.z * scale.x, position.x * scale.y);
    vec4 cx = texture2D(texInput, tx).rgba * bf.x;
    vec4 cy = texture2D(texInput, ty).rgba * bf.y;
    vec4 cz = texture2D(texInput, tz).rgba * bf.z; 

    return cx + cy + cz;
}

void main() {

    vec4 debugA = vec4(1.0, 0.0, 0.0, 1.0);
    vec4 debugB = vec4(0.0, 1.0, 0.0, 1.0);

    float alpha = opacity;
    alpha *= texture2D( alphaMap, alphaMapUv ).g;
    vec3 emissiveSample;
    vec3 colorSample;
    if (useTriplanarMapping){
        //emissiveSample = triplanar_mapping( emissiveMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vPosition, triplanarMappingScale ).rgb;
        //emissiveSample = triplanar_mapping( emissiveMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, triplanarMappingScale ).rgb;

        // a local coordinate based approach for now
        emissiveSample = triplanar_mapping( emissiveMap, vec3(0.0, 0.0, 1.0), vPosition, triplanarMappingScale ).rgb;
        colorSample = triplanar_mapping( colorMap, vec3(0.0, 0.0, 1.0), vPosition, triplanarMappingScale ).rgb;
        //emissiveSample = triplanar_mapping( emissiveMap, vNormal, vPosition, triplanarMappingScale ).rgb;
        //emissiveSample = vWorldPosition;
        //emissiveSample *= vec3(1.0, 0.5, 0.5);
    } else {
        emissiveSample = texture2D( emissiveMap, emissiveMapUv ).rgb;
        colorSample = texture2D( colorMap, mapUv ).rgb;
    }
    vec3 endColor = color * colorSample;

    if (emissionOnly){
        emissiveSample *= bloomIntensity;
        endColor = emissiveSample;
    } else {
        //emissiveSample = color;
        emissiveSample *= emissive * emissiveIntensity;
        //emissiveSample *= color;
        //emissiveSample += color;
        endColor += emissiveSample;
        //endColor = mix(emissiveSample, color, 0.25);
    }

    //endColor = color * colorSample;

    if (normalOnly){
        // for some reason this matrix transformation doesn't work
        //emissiveSample = inverseTransformDirection( normalize( vNormal ), viewMatrix ) * 0.5 + 0.5;
        //emissiveSample = vNormal * 0.5 + 0.5;
        alpha = 0.0;
    }

    if (hide){
        alpha = 0.0;
    }

    //gl_FragColor = mix(debugA, debugB, alpha);
    
    if (opacityToR){
        gl_FragColor = vec4(1.0, 0.0, 0.0, alpha);
    } else {
        gl_FragColor.rgb = endColor;
        gl_FragColor.a = alpha;
    }
}
`