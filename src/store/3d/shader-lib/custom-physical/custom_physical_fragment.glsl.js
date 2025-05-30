

import IridescenceSampler from "./frag/iridescence_sampler.glsl";
// eslint-disable-next-line import/no-anonymous-default-export
export default /* glsl */`
// CUSTOM FRAGMENT
#define varying in
layout(location = 0) out highp vec4 pc_fragColor;
layout(location = 1) out highp vec4 out_normal;
layout(location = 2) out highp vec4 out_orm;
#define gl_FragColor pc_fragColor
#define gl_FragDepthEXT gl_FragDepth
#define texture2D texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DProjLodEXT textureProjLod
#define textureCubeLodEXT textureLod
#define texture2DGradEXT textureGrad
#define texture2DProjGradEXT textureProjGrad
#define textureCubeGradEXT textureGrad
precision highp float;
precision highp int;
#define HIGH_PRECISION
#define SHADER_NAME MeshPhysicalMaterial
#define STANDARD 
#define PHYSICAL 
#define GAMMA_FACTOR 2
#define USE_FOG
#define USE_MAP
#define USE_ENVMAP
#define ENVMAP_TYPE_CUBE
#define ENVMAP_MODE_REFLECTION
#define ENVMAP_BLENDING_NONE
#define USE_LIGHTMAP
#define USE_AOMAP
#define USE_EMISSIVEMAP
#define USE_BUMPMAP
#define USE_NORMALMAP
#define TANGENTSPACE_NORMALMAP
#define USE_ROUGHNESSMAP
#define USE_METALNESSMAP
#define USE_ALPHAMAP
#define USE_UV
#define TEXTURE_LOD_EXT
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;
#define TONE_MAPPING
#ifndef saturate
#define saturate(a) clamp( a, 0.0, 1.0 )
#endif

uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }
vec3 toneMapping( vec3 color ) { return LinearToneMapping( color ); }
#define DITHERING

vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {
	return vec4( pow( value.rgb, vec3( gammaFactor ) ), value.a );
}
vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {
	return vec4( pow( value.rgb, vec3( 1.0 / gammaFactor ) ), value.a );
}
vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 RGBEToLinear( in vec4 value ) {
	return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );
}
vec4 LinearToRGBE( in vec4 value ) {
	float maxComponent = max( max( value.r, value.g ), value.b );
	float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );
	return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );
}
vec4 RGBMToLinear( in vec4 value, in float maxRange ) {
	return vec4( value.rgb * value.a * maxRange, 1.0 );
}
vec4 LinearToRGBM( in vec4 value, in float maxRange ) {
	float maxRGB = max( value.r, max( value.g, value.b ) );
	float M = clamp( maxRGB / maxRange, 0.0, 1.0 );
	M = ceil( M * 255.0 ) / 255.0;
	return vec4( value.rgb / ( M * maxRange ), M );
}
vec4 RGBDToLinear( in vec4 value, in float maxRange ) {
	return vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );
}
vec4 LinearToRGBD( in vec4 value, in float maxRange ) {
	float maxRGB = max( value.r, max( value.g, value.b ) );
	float D = max( maxRange / maxRGB, 1.0 );
	D = clamp( floor( D ) / 255.0, 0.0, 1.0 );
	return vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );
}
const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );
vec4 LinearToLogLuv( in vec4 value ) {
	vec3 Xp_Y_XYZp = cLogLuvM * value.rgb;
	Xp_Y_XYZp = max( Xp_Y_XYZp, vec3( 1e-6, 1e-6, 1e-6 ) );
	vec4 vResult;
	vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
	float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
	vResult.w = fract( Le );
	vResult.z = ( Le - ( floor( vResult.w * 255.0 ) ) / 255.0 ) / 255.0;
	return vResult;
}
const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );
vec4 LogLuvToLinear( in vec4 value ) {
	float Le = value.z * 255.0 + value.w;
	vec3 Xp_Y_XYZp;
	Xp_Y_XYZp.y = exp2( ( Le - 127.0 ) / 2.0 );
	Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;
	Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;
	vec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;
	return vec4( max( vRGB, 0.0 ), 1.0 );
}
vec4 mapTexelToLinear( vec4 value ) { return LinearToLinear( value ); }
vec4 envMapTexelToLinear( vec4 value ) { return LinearToLinear( value ); }
vec4 emissiveMapTexelToLinear( vec4 value ) { return sRGBToLinear( value ); }
vec4 lightMapTexelToLinear( vec4 value ) { return LinearToLinear( value ); }
vec4 linearToOutputTexel( vec4 value ) { return LinearToLinear( value ); }

#define STANDARD


uniform bool anisotropyDebug;
uniform bool anisotropicReflections;
uniform bool anisotropyEnabled; // high level control
uniform float anisotropyStrength;

uniform bool reflectionDebug;
uniform bool overblowDebug;
uniform float magic1;
uniform float magic2;
uniform float magic3;

uniform bool iridescent;

uniform bool orthographicCubemapping;

uniform samplerCube ormCubemap;
uniform samplerCube normalCubemap;
uniform samplerCube defaultNormalCubemap;
uniform samplerCube standardCubemap; // this is the regular cubemap, could be handled otherwise too
uniform int reflectionBounces;

// replacement
// also: use a define as a preprocessor parameter?
// see: https://stackoverflow.com/questions/30585265/what-can-i-use-as-an-array-index-in-glsl-in-webgl
// hazard note: if this doesn't get unrolled, hell breaks loose?
// might not work correctly, we are hitting the max number of texture units per shader
//uniform int cubemapArraySize;
//uniform samplerCube[DIFFUSE_CUBEMAP_ARRAY_SIZE] diffuseCubemapArray;

// this is not possible with threejs currently because it uses glsl 3 (300), not 4
//uniform samplerCubeArray testarray;

// TODO: remove this...
//uniform samplerCube diffuseCubemapA;
//uniform samplerCube diffuseCubemapB;
//uniform float diffuseCubemapBlending;
// ...to this

#ifdef PHYSICAL
	#define REFLECTIVITY
	#define CLEARCOAT
	#define TRANSMISSION
#endif

uniform bool uv2AlphaMap;
uniform bool uv1AOMap;

uniform bool diffuseOnly;
uniform bool emissionOnly;
uniform bool ormOnly;
uniform bool normalOnly;
uniform bool opacityToR;
uniform bool noEnvironmentMapping; // replace this with diffuse only
uniform float bloomIntensity;

// old defines as dynamic
uniform bool objectspace_normalmap;
uniform bool flip_sided;
uniform bool double_sided;
uniform bool tangentspace_normalmap;
uniform bool use_tangent;
uniform bool use_bumpmap;



// had trouble with this struct thing
struct TpmData {
	bool useTpmMap;
	bool useTpmNormalMap;
    bool useTpmMetalnessMap;
    bool useTpmRoughnessMap;
    bool useTpmEmissiveMap;

    bool tilt;

    // vec2 mapTpmScale; // no idea why these didn't work
    // vec2 normalTpmScale;
    // vec2 metalnessTpmScale;
    // vec2 roughnessTpmScale;
    // vec2 emissiveTpmScale;
};

uniform TpmData tpmData;

uniform vec2 mapTpmScale;
uniform vec2 normalTpmScale;
uniform vec2 metalnessTpmScale;
uniform vec2 roughnessTpmScale;
uniform vec2 emissiveTpmScale;

vec4 triplanar_mapping( sampler2D texInput, vec3 normal, vec3 position, vec2 scale ) {

    vec3 bf = normalize( abs( normal ) );
    bf /= dot( bf, vec3( 1.0 ) );

    // scale = 1.0 / scale; // tested this because scale didn't work at one point
    vec2 tx;
    vec2 tz;
    if (tpmData.tilt){
        tx = vec2(position.y * scale.x, position.z * scale.y);
        tz = vec2(position.y * scale.x, position.x * scale.y);
    } else {
        tx = vec2(position.z * scale.x, position.y * scale.y);
        tz = vec2(position.x * scale.x, position.y * scale.y);
    }
    
    vec2 ty = vec2(position.z * scale.x, position.x * scale.y);
    vec4 cx = texture2D(texInput, tx).rgba * bf.x;
    vec4 cy = texture2D(texInput, ty).rgba * bf.y;
    vec4 cz = texture2D(texInput, tz).rgba * bf.z; 

    return cx + cy + cz;
}


#ifndef saturate
// <common> may have defined saturate() already
#define saturate(a) clamp( a, 0.0, 1.0 )
#endif

#define TONEMAP_NONE 0
#define TONEMAP_LINEAR 1
#define TONEMAP_REINHARD 2
#define TONEMAP_CINEON 3
#define TONEMAP_ACES 4
#define TONEMAP_CUSTOM 5

struct TonemappingData {
	int type;
	float exposure;
};

uniform TonemappingData tonemappingData;

// exposure only
vec3 LinearToneMapping( vec3 color, float exposure ) {

	return exposure * color;

}

// source: https://www.cs.utah.edu/~reinhard/cdrom/
vec3 ReinhardToneMapping( vec3 color, float exposure  ) {

	color *= exposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );

}

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
vec3 OptimizedCineonToneMapping( vec3 color, float exposure  ) {

	// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
	color *= exposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );

}

// this implementation of ACES is modified to accommodate a brighter viewing environment.
// the scale factor of 1/0.6 is subjective. see discussion in #19621.

vec3 ACESFilmicToneMapping( vec3 color, float exposure  ) {

	// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);

	// ODT_SAT => XYZ => D60_2_D65 => sRGB
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);

	color *= exposure / 0.6;

	color = ACESInputMat * color;

	// Apply RRT and ODT
	color = RRTAndODTFit( color );

	color = ACESOutputMat * color;

	// Clamp to [0, 1]
	return saturate( color );

}



// good idea but it seems that the javascript object reference became bit of a burden
// struct BoxProjectionData {
//   bool useBoxProjection;
//   vec3 size;
//   vec3 position;
// };

// uniform BoxProjectionData boxProjectionData;


uniform bool useBoxProjection;
uniform vec3 boxProjectionSize;
uniform vec3 boxProjectionPosition;

// gets the given position relative to the cube size
vec3 getNormalizedPosition(vec3 cubeSize, vec3 cubePos, vec3 vWorldPosition){
  vec3 adjustedPosition = vWorldPosition - cubePos;
  vec3 normalizedCoords = vec3(
    adjustedPosition.x / cubeSize.x,
    adjustedPosition.y / cubeSize.y,
    adjustedPosition.z / cubeSize.z
  );
  return normalizedCoords;
}

  vec3 parallaxCorrectedNormal( vec3 v, vec3 cubeSize, vec3 cubePos, vec3 vWorldPosition ) {
    vec3 nDir = normalize( v );
    vec3 rbmax = ( .5 * cubeSize + cubePos - vWorldPosition ) / nDir;
    vec3 rbmin = ( -.5 * cubeSize + cubePos - vWorldPosition ) / nDir;
    vec3 rbminmax;
    rbminmax.x = ( nDir.x > 0. ) ? rbmax.x : rbmin.x;
    rbminmax.y = ( nDir.y > 0. ) ? rbmax.y : rbmin.y;
    rbminmax.z = ( nDir.z > 0. ) ? rbmax.z : rbmin.z;
    float correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
    vec3 boxIntersection = vWorldPosition + nDir * correction;
    return boxIntersection - cubePos;
  }



  vec3 getOrthographicBoxReflectionUVW(vec3 reflectionDirection, vec3 previousReflectionDirection){
    vec3 commonReflectionVector = parallaxCorrectedNormal( reflectionDirection, boxProjectionSize, vec3(0.0), previousReflectionDirection);
    vec3 adjustmentScale = 1.0 / boxProjectionSize;
    return commonReflectionVector * adjustmentScale;
  }



uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 emissive2;
// vec3 emissive2 = vec3(1.0, 0.0, 0.0);
uniform float roughness;
uniform float metalness;
uniform float opacity;

#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform vec3 attenuationColor;
	uniform float attenuationDistance;
#endif
#ifdef REFLECTIVITY
	uniform float reflectivity;
#endif

#ifdef CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif

#ifdef USE_SHEEN
	uniform vec3 sheen;
#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif

varying vec3 vWorldPosition;
varying vec3 vAnisotropicTangent;

#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate(a) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement(a) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c);
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float max3( vec3 v ) { return max( max( v.x, v.y ), v.z ); }
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
	float distance = dot( planeNormal, point - pointOnPlane );
	return - distance * planeNormal + point;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float linearToRelativeLuminance( const in vec3 color ) {
	vec3 weights = vec3( 0.2126, 0.7152, 0.0722 );
	return dot( weights, color.rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ));
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w);
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return (( near + viewZ ) * far ) / (( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}
#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif
#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif
#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif
#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif


// create variables of the base UV map for different maps

#ifdef USE_MAP
	varying vec2 mapUv;
#endif

#ifdef USE_BUMPMAP
	varying vec2 bumpMapUv;
#endif

varying vec2 normalMapUv;

#ifdef USE_ALPHAMAP
	varying vec2 alphaMapUv;
#endif

#ifdef USE_EMISSIVEMAP
	varying vec2 emissiveMapUv;
#endif

#ifdef USE_ROUGHNESSMAP
	varying vec2 roughnessMapUv;
#endif

#ifdef USE_METALNESSMAP
	varying vec2 metalnessMapUv;
#endif


#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif
#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif
#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif
#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif



vec3 desaturate(in vec3 value, in float factor){
  vec3 gray = vec3( dot( value , vec3( 0.2126 , 0.7152 , 0.0722 ) ) );
  return vec3(mix(value, gray, factor));
}

// helper to convert vectors from -1 to 1 into 0 to 1
vec3 visualizeVector(in vec3 vector){
  return vector * 1.0 + vec3(1.0);
}

// this will use an explicit tangent, useful for flipping aniso direction for some effects
vec3 getAnisotropizedNormalExplicit(in vec3 normal, in vec3 tangent, in vec3 viewDir, in float strength){ 
  // see how perpendicular we are to the tangent direction
  float dotTV = dot(viewDir, tangent);
  float dotSample = pow(dotTV, 3.0);
  vec3 anisoAdjustedNormal = mix(normal, tangent, min(dotSample * strength, 1.0));
  //vec3 anisoAdjustedNormal = mix(debug1, debug2, dotSample);
  return anisoAdjustedNormal;
}

// skews the normal towards the anisotropy direction based on viewing angle
vec3 getAnisotropizedNormal(in vec3 normal, in vec3 tangent, in vec3 viewDir, in float strength){ 
  vec3 debug1 = vec3(1.0, 0.0, 0.0);
  vec3 debug2 = vec3(0.0, 1.0, 0.0);
  vec3 antiTangent = reflect(-tangent, normal);
  vec3 closerTangent = vec3(0.0);
  if (distance(viewDir, antiTangent) < distance(viewDir, tangent)){
      closerTangent = antiTangent;
  } else {
      closerTangent = tangent;
  }
  vec3 anisoAdjustedNormal = getAnisotropizedNormalExplicit(normal, closerTangent, viewDir, strength);
  //vec3 anisoAdjustedNormal = mix(debug1, debug2, dotSample);
  return anisoAdjustedNormal;
}

vec3 getLightAnisotropyNormal(in vec3 lightDir, in vec3 normal, in vec3 tangent, in vec3 viewDir, in float strength){
  vec3 debug1 = vec3(1.0, 0.0, 0.0);
  vec3 debug2 = vec3(0.0, 1.0, 0.0);

  vec3 maskDir = normalize( lightDir + viewDir * (magic3 - 1.0));

  //vec3 anisoNormal = getAnisotropizedNormal(normal, tangent, viewDir, strength);
  vec3 viewReflect = reflect(-viewDir, normal);
  float dotVRL = dot(viewReflect, lightDir);
  float dotMask = dot(viewReflect, maskDir);
  //float dotNL = dot(normal, lightDir);
  float mainFactor = 10.0 * magic1;
  float maskFactor = 11.0 * magic2;
  float adjustedVRL = saturate(-mainFactor + (mainFactor + 1.0) * dotVRL);
  float adjustedMask = saturate(-maskFactor + (maskFactor + 1.0) * dotMask);
  float dotNV = dot(normal, viewDir);

  //float maskedDot = mix()
  
  return mix(debug1 * adjustedVRL, debug2 * adjustedMask, 0.5);
  //return visualizeVector(anisoNormal);
  //return anisoNormal;
}




// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec2 integrateSpecularBRDF( const in float dotNV, const in float roughness ) {
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	vec4 r = roughness * c0 + c1;

	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

	return vec2( -1.04, 1.04 ) * a004 + r.zw;

}

float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

#if defined ( PHYSICALLY_CORRECT_LIGHTS )

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	// this is intended to be used on spot and point lights who are represented as luminous intensity
	// but who must be converted to luminous irradiance for surface lighting calculation
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );

	if( cutoffDistance > 0.0 ) {

		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

	}

	return distanceFalloff;

#else

	if( cutoffDistance > 0.0 && decayExponent > 0.0 ) {

		return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

	}

	return 1.0;

#endif

}

vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {

	return RECIPROCAL_PI * diffuseColor;

} // validated

vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );

	return ( 1.0 - specularColor ) * fresnel + specularColor;

} // validated

vec3 F_Schlick_RoughnessDependent( const in vec3 F0, const in float dotNV, const in float roughness ) {

	// See F_Schlick
	float fresnel = exp2( ( -5.55473 * dotNV - 6.98316 ) * dotNV );
	vec3 Fr = max( vec3( 1.0 - roughness ), F0 ) - F0;

	return Fr * fresnel + F0;

}


// Microfacet Models for Refraction through Rough Surfaces - equation (34)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {

	// geometry term (normalized) = G(l)⋅G(v) / 4(n⋅l)(n⋅v)
	// also see #12151

	float a2 = pow2( alpha );

	float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );

	return 1.0 / ( gl * gv );

} // validated

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {

	float a2 = pow2( alpha );

	// dotNL and dotNV are explicitly swapped. This is not a mistake.
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );

	return 0.5 / max( gv + gl, EPSILON );

}

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float D_GGX( const in float alpha, const in float dotNH ) {

	float a2 = pow2( alpha );

	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return RECIPROCAL_PI * a2 / pow2( denom );

}

// GGX Distribution, Schlick Fresnel, GGX-Smith Visibility
vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {

	float alpha = pow2( roughness ); // UE4's roughness

	vec3 halfDir = normalize( incidentLight.direction + viewDir );
    
    // getAnisotropizedNormal(in vec3 normal, in vec3 tangent, in vec3 viewDir, in float strength){ 
    //vec3 anisotropizedNormal = getLightAnisotropyNormal(normal, vAnisotropicTangent, viewDir, anisotropyStrength * magic1);

    
	float dotNL = saturate( dot( normal, incidentLight.direction ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
    
    /*
	float dotNL = saturate( dot( anisotropizedNormal, incidentLight.direction ) );
	float dotNV = saturate( dot( anisotropizedNormal, viewDir ) );
	float dotNH = saturate( dot( anisotropizedNormal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
    */

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );

	float D = D_GGX( alpha, dotNH );

    if (reflectionDebug){
        return vec3(0.0);
    }
	return F * ( G * D );

} // validated

// Rect Area Light

// Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
// by Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
// code: https://github.com/selfshadow/ltc_code/

vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {

	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	float dotNV = saturate( dot( N, V ) );

	// texture parameterized by sqrt( GGX alpha ) and sqrt( 1 - cos( theta ) )
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );

	uv = uv * LUT_SCALE + LUT_BIAS;

	return uv;

}

float LTC_ClippedSphereFormFactor( const in vec3 f ) {

	// Real-Time Area Lighting: a Journey from Research to Production (p.102)
	// An approximation of the form factor of a horizon-clipped rectangle.

	float l = length( f );

	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );

}

vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {

	float x = dot( v1, v2 );

	float y = abs( x );

	// rational polynomial approximation to theta / sin( theta ) / 2PI
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;

	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;

	return cross( v1, v2 ) * theta_sintheta;

}

vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {

	// bail if point is on back side of plane of light
	// assumes ccw winding order of light vertices
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );

	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );

	// construct orthonormal basis around N
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 ); // negated from paper; possibly due to a different handedness of world coordinate system

	// compute transform
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );

	// transform rect
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );

	// project rect onto sphere
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );

	// calculate vector form factor
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );

	// adjust for horizon clipping
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );

/*
	// alternate method of adjusting for horizon clipping (see referece)
	// refactoring required
	float len = length( vectorFormFactor );
	float z = vectorFormFactor.z / len;

	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	// tabulated horizon-clipped sphere, apparently...
	vec2 uv = vec2( z * 0.5 + 0.5, len );
	uv = uv * LUT_SCALE + LUT_BIAS;

	float scale = texture2D( ltc_2, uv ).w;

	float result = len * scale;
*/

	return vec3( result );

}

// End Rect Area Light

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec3 BRDF_Specular_GGX_Environment( const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {

	float dotNV = saturate( dot( normal, viewDir ) );

	vec2 brdf = integrateSpecularBRDF( dotNV, roughness );

	return specularColor * brdf.x + brdf.y;

} // validated

// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multiscattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
void BRDF_Specular_Multiscattering_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {

	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

	vec3 F = F_Schlick_RoughnessDependent( specularColor, dotNV, roughness );
	vec2 brdf = integrateSpecularBRDF( dotNV, roughness );
	vec3 FssEss = F * brdf.x + brdf.y;

	float Ess = brdf.x + brdf.y;
	float Ems = 1.0 - Ess;

	vec3 Favg = specularColor + ( 1.0 - specularColor ) * 0.047619; // 1/21
	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );

	singleScatter += FssEss;
	multiScatter += Fms * Ems;

}

float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}

vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );

	//float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	//float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

} // validated

// source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html
float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {
	return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );
}

float BlinnExponentToGGXRoughness( const in float blinnExponent ) {
	return sqrt( 2.0 / ( blinnExponent + 2.0 ) );
}

#if defined( USE_SHEEN )

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs#L94
float D_Charlie(float roughness, float NoH) {
	// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF"
	float invAlpha = 1.0 / roughness;
	float cos2h = NoH * NoH;
	float sin2h = max(1.0 - cos2h, 0.0078125); // 2^(-14/2), so sin2h^2 > 0 in fp16
	return (2.0 + invAlpha) * pow(sin2h, invAlpha * 0.5) / (2.0 * PI);
}

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs#L136
float V_Neubelt(float NoV, float NoL) {
	// Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
	return saturate(1.0 / (4.0 * (NoL + NoV - NoL * NoV)));
}

vec3 BRDF_Specular_Sheen( const in float roughness, const in vec3 L, const in GeometricContext geometry, vec3 specularColor ) {

	vec3 N = geometry.normal;
	vec3 V = geometry.viewDir;

	vec3 H = normalize( V + L );
	float dotNH = saturate( dot( N, H ) );

	return specularColor * D_Charlie( roughness, dotNH ) * V_Neubelt( dot(N, V), dot(N, L) );

}

#endif

//#include <bsdfs>
#ifdef USE_TRANSMISSION
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec4 vWorldPosition;
	vec3 getVolumeTransmissionRay(vec3 n, vec3 v, float thickness, float ior, mat4 modelMatrix) {
		vec3 refractionVector = refract(-v, normalize(n), 1.0 / ior);
		vec3 modelScale;
		modelScale.x = length(vec3(modelMatrix[0].xyz));
		modelScale.y = length(vec3(modelMatrix[1].xyz));
		modelScale.z = length(vec3(modelMatrix[2].xyz));
		return normalize(refractionVector) * thickness * modelScale;
	}
	float applyIorToRoughness(float roughness, float ior) {
		return roughness * clamp(ior * 2.0 - 2.0, 0.0, 1.0);
	}
	vec3 getTransmissionSample(vec2 fragCoord, float roughness, float ior) {
		float framebufferLod = log2(transmissionSamplerSize.x) * applyIorToRoughness(roughness, ior);
		return texture2DLodEXT(transmissionSamplerMap, fragCoord.xy, framebufferLod).rgb;
	}
	vec3 applyVolumeAttenuation(vec3 radiance, float transmissionDistance, vec3 attenuationColor, float attenuationDistance) {
		if (attenuationDistance == 0.0) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log(attenuationColor) / attenuationDistance;
			vec3 transmittance = exp(-attenuationCoefficient * transmissionDistance);			return transmittance * radiance;
		}
	}
	vec3 getIBLVolumeRefraction(vec3 n, vec3 v, vec3 viewDir, float perceptualRoughness, vec3 baseColor, vec3 f0, vec3 f90,
		vec3 position, mat4 modelMatrix, mat4 viewMatrix, mat4 projMatrix, float ior, float thickness, vec3 attenuationColor, float attenuationDistance) {
		vec3 transmissionRay = getVolumeTransmissionRay(n, v, thickness, ior, modelMatrix);
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4(refractedRayExit, 1.0);
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec3 transmittedLight = getTransmissionSample(refractionCoords, perceptualRoughness, ior);
		vec3 attenuatedColor = applyVolumeAttenuation(transmittedLight, length(transmissionRay), attenuationColor, attenuationDistance);
		float NdotV = saturate(dot(n, viewDir));
		vec2 brdf = integrateSpecularBRDF(NdotV, perceptualRoughness);
		vec3 specularColor = f0 * brdf.x + f90 * brdf.y;
		return (1.0 - specularColor) * attenuatedColor * baseColor;
	}
#endif
#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_maxMipLevel 8.0
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_maxTileSize 256.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		float texelSize = 1.0 / ( 3.0 * cubeUV_maxTileSize );
		vec2 uv = getUV( direction, face ) * ( faceSize - 1.0 );
		vec2 f = fract( uv );
		uv += 0.5 - f;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		if ( mipInt < cubeUV_maxMipLevel ) {
			uv.y += 2.0 * cubeUV_maxTileSize;
		}
		uv.y += filterInt * 2.0 * cubeUV_minTileSize;
		uv.x += 3.0 * max( 0.0, cubeUV_maxTileSize - 2.0 * faceSize );
		uv *= texelSize;
		vec3 tl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		uv.x += texelSize;
		vec3 tr = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		uv.y += texelSize;
		vec3 br = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		uv.x -= texelSize;
		vec3 bl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		vec3 tm = mix( tl, tr, f.x );
		vec3 bm = mix( bl, br, f.x );
		return mix( tm, bm, f.y );
	}
	#define r0 1.0
	#define v0 0.339
	#define m0 - 2.0
	#define r1 0.8
	#define v1 0.276
	#define m1 - 1.0
	#define r4 0.4
	#define v4 0.046
	#define m4 2.0
	#define r5 0.305
	#define v5 0.016
	#define m5 3.0
	#define r6 0.21
	#define v6 0.0038
	#define m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= r1 ) {
			mip = ( r0 - roughness ) * ( m1 - m0 ) / ( r0 - r1 ) + m0;
		} else if ( roughness >= r4 ) {
			mip = ( r1 - roughness ) * ( m4 - m1 ) / ( r1 - r4 ) + m1;
		} else if ( roughness >= r5 ) {
			mip = ( r4 - roughness ) * ( m5 - m4 ) / ( r4 - r5 ) + m4;
		} else if ( roughness >= r6 ) {
			mip = ( r5 - roughness ) * ( m6 - m5 ) / ( r5 - r6 ) + m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), m0, cubeUV_maxMipLevel );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif
#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform int maxMipLevel;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif
//#include <envmap_physical_pars_fragment>

#if defined( USE_ENVMAP )

	#ifdef ENVMAP_MODE_REFRACTION
		uniform float refractionRatio;
	#endif

	vec3 getLightProbeIndirectIrradiance( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in int maxMIPLevel ) {

		vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );

		#ifdef ENVMAP_TYPE_CUBE

			vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );

			// TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
			// of a specular cubemap, or just the default level of a specially created irradiance cubemap.

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );

			#else

				// force the bias high to get the last LOD level as it is the most blurred.
				vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );

			#endif

			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#elif defined( ENVMAP_TYPE_CUBE_UV )

			vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
			vec4 envMapColor = textureCubeUV( envMap, queryVec, 1.0 );

		#else

			vec4 envMapColor = vec4( 0.0 );

		#endif

		return PI * envMapColor.rgb * envMapIntensity;

	}

	// Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
	float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {

		float maxMIPLevelScalar = float( maxMIPLevel );

		float sigma = PI * roughness * roughness / ( 1.0 + roughness );
		float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

		
		// clamp to allowable LOD ranges.
		return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

	}

	vec3 getLightProbeIndirectRadiance( /*const in SpecularLightProbe specularLightProbe,*/ const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {



		#ifdef ENVMAP_MODE_REFLECTION

		  vec3 reflectVec = reflect( -viewDir, normal );

		  // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
		  reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

		#else

		  vec3 reflectVec = refract( -viewDir, normal, refractionRatio );

		#endif
		
		reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

		float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );

		#ifdef ENVMAP_TYPE_CUBE

			vec3 queryReflectVec;
			if (useBoxProjection) {
				queryReflectVec = parallaxCorrectedNormal( reflectVec, boxProjectionSize, boxProjectionPosition, vWorldPosition);
			} else {
				queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
			}

			vec4 envMapColor;
			if (anisotropicReflections && anisotropyEnabled){
				

    // figure out the reflection point
  vec3 adjustmentScale = 1.0 / boxProjectionSize;
  queryReflectVec = queryReflectVec * adjustmentScale;
  float anisotropyMipLevel = specularMIPLevel * 0.7;

  vec4 regularRoughnessReflection = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );
  const int samples = 16;
  float samplesFloat = float(samples);
  vec3 worldNormal = inverseTransformDirection( normalize( vNormal ), viewMatrix );
  vec3 worldTangent = inverseTransformDirection( normalize( vAnisotropicTangent ), viewMatrix );
  vec3 worldBitangent = cross(worldNormal, worldTangent);

  vec3 anisotropyDirection;
  vec3 anisotropyCrossDirection;

  if (tpmData.tilt){
    anisotropyDirection = worldBitangent;
    anisotropyCrossDirection = worldTangent;
  } else {
    anisotropyDirection = worldTangent;
    anisotropyCrossDirection = worldBitangent;
  }

  //anisotropyDirection = vec3(1.0, 0.0, 0.0);
  vec3 accumulator = vec3(0.0);
  vec3 anisotropyVector;
  float anisotropyPhase = 0.0;
  vec3 forwardVector;
  vec3 backwardVector;

  
  vec4 ormSample = textureCubeLodEXT( ormCubemap, queryReflectVec, specularMIPLevel);

  //accumulator += baseSample.xyz / samplesFloat;

  for (int i = 1; i <= samples; i++){
    float iFloat = float(i);
    anisotropyPhase = iFloat / samplesFloat;
    anisotropyVector = anisotropyDirection * (anisotropyPhase * anisotropyStrength );
    anisotropyVector = mix(anisotropyVector, vec3(0.0), (1.0 - roughness));
    //anisotropyVector = normalize(anisotropyVector);

    forwardVector = parallaxCorrectedNormal( normalize(reflectVec + anisotropyVector), boxProjectionSize, boxProjectionPosition, vWorldPosition) * adjustmentScale;
    backwardVector = parallaxCorrectedNormal( normalize(reflectVec - anisotropyVector), boxProjectionSize, boxProjectionPosition, vWorldPosition) * adjustmentScale;

    vec4 forwardSample = textureCubeLodEXT( envMap, forwardVector, anisotropyMipLevel );
    vec4 backwardSample = textureCubeLodEXT( envMap, backwardVector, anisotropyMipLevel );

    float fade = (1.0 - anisotropyPhase) / samplesFloat;

    //accumulator += forwardSample * fade;
    //accumulator += backwardSample * fade;
    accumulator += forwardSample.xyz;
    accumulator += backwardSample.xyz;
  }

  accumulator /= samplesFloat * 2.0;
  vec3 finalMix = mix(accumulator.xyz, regularRoughnessReflection.xyz, 0.0);
  //vec3 finalMix = accumulator;
  //finalMix = arbitraryVectorTangent.xyzz;
  //finalMix = st1.xyxx;
  // finalMix = anisotropyDirection;
  // dunno why this blew out
  envMapColor = vec4(finalMix, 1.0) * mix(1.0 - ormSample.b, 1.0, magic3);

			} else {
				
				if (orthographicCubemapping){
					

    vec3 worldNormal = inverseTransformDirection( normalize( normal ), viewMatrix );
    vec3 worldViewDir = inverseTransformDirection( -viewDir, viewMatrix ); // view dir is from surface to camera, invert it
    vec3 worldTangent = inverseTransformDirection( normalize( vAnisotropicTangent ), viewMatrix );
    vec3 worldBitangent = cross(worldNormal, worldTangent);

    // create a new reflect vector since we don't want to reuse the old stuff
    vec3 anistropizedNormal = getAnisotropizedNormal(worldNormal, worldTangent, worldViewDir, anisotropyStrength);
    reflectVec = reflect( -viewDir, normal );
    reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

	// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
	reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
    if (useBoxProjection) {
        queryReflectVec = parallaxCorrectedNormal( reflectVec, boxProjectionSize, boxProjectionPosition, vWorldPosition);
    } else {
        queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
    }

    vec3 adjustedBoxSize = boxProjectionSize; // tried to see if there is any sense in adjusting the box
    // figure out the reflection point
    vec3 adjustmentScale = 1.0 / adjustedBoxSize;
    vec3 adjustedVector = queryReflectVec * adjustmentScale;


    // testing if we can calculate the distance between points by using the uvw difference
    vec3 previousAdjustedVector = adjustedVector;
    vec3 cubeAdjustedStartingPosition = getNormalizedPosition(adjustedBoxSize, boxProjectionPosition, vWorldPosition) * normalize(adjustmentScale);

    vec4 ormSample;
    vec4 normalSample;
    vec4 envMapSample;
    vec4 accumulation;
    vec3 nextReflectionVector = reflectVec;

    vec4 debugColor1 = vec4(1.0, 0.0, 0.0, 1.0);
    vec4 debugColor2 = vec4(0.0, 1.0, 0.0, 1.0);

    float energyLeft = 1.0;
    float smoothnessLeft = 1.0 - (roughness * 1.5) + 0.05; // no idea why this magic number is needed to hit 0.0
    vec3 colorLeft = vec3(1.0);
    int bouncesDone = 0;
    
    // first hit has travelled from v position to adjusted vector?,
    float distanceTravelled = distance(cubeAdjustedStartingPosition, adjustedVector); // bias the distance a bit

    vec4 diffuseColor = vec4(0.0);
    diffuseColor.rgb = diffuse;
    
    

// these are basic map samplers with uv scaling and offsets and such if they are defined
vec4 texelColor;
if (tpmData.useTpmMap){
	texelColor = triplanar_mapping( map, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, mapTpmScale );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
	// debugColor = vec4(1.0, 0.0, 1.0, 1.0);
} else {
	texelColor = texture2D( map, vUv );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
}


    
    float adjustedSpecularLevel = 0.0; // for debug testing
    float dotProduct = 0.0;
    float occlusionFactor = 1.0;
    float roughnessFactor = roughness; // roughen up when there is no energy
    float metalnessFactor = metalness;


    while(energyLeft > 0.0){
        // a hard cap for reflections
        if (bouncesDone >= reflectionBounces){
            break;
        }
        if (bouncesDone == 1){
            diffuseColor *= 0.75; // a quick and stupid hack to even out some color mess
        }

        float specularLevel = 1.0 - smoothnessLeft;
        adjustedSpecularLevel = mix(specularLevel / 3.0, specularLevel, distanceTravelled); // if we haven't travelled far, we can use a sharper version
        
        float specularMipLevel = getSpecularMIPLevel(adjustedSpecularLevel, maxMIPLevel);
        float normalizedMipLevel = specularMipLevel / float(maxMIPLevel);
        queryReflectVec = parallaxCorrectedNormal( nextReflectionVector, boxProjectionSize, vec3(0.0), queryReflectVec);
        adjustedVector = queryReflectVec * adjustmentScale;

        //adjustedVector = mix(adjustedVector, worldTangent, 1.0 - magic1);

        envMapSample = textureCubeLodEXT(envMap, adjustedVector, specularMipLevel);

        ormSample = textureCubeLodEXT( ormCubemap, adjustedVector, specularMipLevel);
        
        normalSample = textureCube( normalCubemap, adjustedVector) * 2.0 - 1.0;
        vec4 defaultNormalSample = textureCube( defaultNormalCubemap, adjustedVector) * 2.0 - 1.0;
        vec3 adjustedNormalSample = mix(normalSample.xyz, defaultNormalSample.xyz, normalizedMipLevel);

        nextReflectionVector = reflect( nextReflectionVector, adjustedNormalSample );
        roughnessFactor = max(ormSample.y, roughnessFactor); // we don't actually want to make the reflection too glossy if there is a mirror behind it
        metalnessFactor = ormSample.z;

        // this fixes steel roughness
        //roughnessFactor = 1.0 - roughnessFactor;
        //roughnessFactor += ormSample.y * 0.5;

        float mirrorness = max(metalnessFactor - roughnessFactor, 0.0);
        float adjustmentFactor = 1.0;

        // contribute less with high mirrorness
        // TODO: find out a bit better name for this one
        adjustmentFactor = 1.0 - mirrorness;

        vec3 finalSample = envMapSample.rgb * colorLeft * adjustmentFactor;

        // basically move the graph so that it starts to affect only from 0.5 onwards
        float mixFactor = max(1.0 - adjustedSpecularLevel * 2.0, 0.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, finalSample, mixFactor);

        //diffuseSample = desaturate(diffuseColor.rgb, (1.0 - energyLeft)); // remove saturation buildup, but not completely

        accumulation.rgb = mix(accumulation.rgb, diffuseColor.rgb, energyLeft);

        float lossFactor = 1.0 - (roughnessFactor * (1.0 - mixFactor));
        energyLeft *= lossFactor;
        previousAdjustedVector = adjustedVector;
        colorLeft *= envMapSample.rgb;
        float smoothnessLoss = adjustmentFactor + adjustedSpecularLevel;
        smoothnessLeft = max(0.0, smoothnessLeft - smoothnessLoss); // maybe not neccessary
        distanceTravelled += distance(previousAdjustedVector, adjustedVector);
        bouncesDone++;
    }

    if (reflectionDebug){
        // remove artefacts
        //envMapColor.rgb = getAnisotropizedNormal(worldNormal, worldTangent, worldViewDir, anisotropyStrength);
        vec3 lightDir = normalize(vec3(1.0, -1.0, 0.0));
        envMapColor.rgb = getLightAnisotropyNormal(lightDir, worldNormal, worldTangent, worldViewDir, anisotropyStrength);
        //envMapColor.rgb = normalize(queryReflectVec);
        //envMapColor.rgb = worldTangent;
        //envMapColor.rgb = worldBitangent;
        envMapColor.a = 1.0;
    } else {
        envMapColor = accumulation;
    }

    

				} else {
				
					#if defined( TEXTURE_LOD_EXT )
						envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );
					#else
						envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
					#endif
				}
			}
			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#elif defined( ENVMAP_TYPE_CUBE_UV )

			vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
			vec4 envMapColor = textureCubeUV( envMap, queryReflectVec, roughness );

		#elif defined( ENVMAP_TYPE_EQUIREC )

			vec2 sampleUV;
			sampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
			sampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );

			#else

				vec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );

			#endif

			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#elif defined( ENVMAP_TYPE_SPHERE )

			vec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );

			#else

				vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );

			#endif

			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#endif

		return envMapColor.rgb * envMapIntensity;

	}

#endif

#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float fogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif

uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];

const int MAX_LIGHTS_PER_TYPE = 10;

// get the irradiance (radiance convolved with cosine lobe) at the point 'normal' on the unit sphere
// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {

	// normal is assumed to have unit length

	float x = normal.x, y = normal.y, z = normal.z;

	// band 0
	vec3 result = shCoefficients[ 0 ] * 0.886227;

	// band 1
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;

	// band 2
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );

	return result;

}

vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in GeometricContext geometry ) {

	vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );

	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );

	return irradiance;

}

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

	vec3 irradiance = ambientLightColor;


	return irradiance;

}

#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

	void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {

		directLight.color = directionalLight.color;
		directLight.direction = directionalLight.direction;
		directLight.visible = true;

	}

#endif


#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

	// directLight is an out parameter as having it as a return value caused compiler errors on some devices
	void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {

		vec3 lVector = pointLight.position - geometry.position;
		directLight.direction = normalize( lVector );

		float lightDistance = length( lVector );

		directLight.color = pointLight.color;
		directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );
		directLight.visible = ( directLight.color != vec3( 0.0 ) );

	}

#endif


	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};

    uniform SpotLight spotLights[ MAX_LIGHTS_PER_TYPE ];
	//uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
    uniform int numOfSpotlights;

	// directLight is an out parameter as having it as a return value caused compiler errors on some devices
	void getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight ) {

		vec3 lVector = spotLight.position - geometry.position;
		directLight.direction = normalize( lVector );

		float lightDistance = length( lVector );
		float angleCos = dot( directLight.direction, spotLight.direction );

		if ( angleCos > spotLight.coneCos ) {

			float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );

			directLight.color = spotLight.color;
			directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );
			directLight.visible = true;

		} else {

			directLight.color = vec3( 0.0 );
			directLight.visible = false;

		}
	}


	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};

	// Pre-computed values of LinearTransformedCosine approximation of BRDF
	// BRDF approximation Texture is 64x64
	uniform sampler2D ltc_1; // RGBA Float
	uniform sampler2D ltc_2; // RGBA Float

	uniform RectAreaLight rectAreaLights[ MAX_LIGHTS_PER_TYPE ];
    uniform int numOfRectArealights;


#if NUM_HEMI_LIGHTS > 0

	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};

	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];

	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {

		float dotNL = dot( geometry.normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );


		return irradiance;

	}

#endif

//#include <lights_pars_begin>
//#include <lights_physical_pars_fragment>

struct PhysicalMaterial {

	vec3 diffuseColor;
	float specularRoughness;
	vec3 specularColor;

#ifdef CLEARCOAT
	float clearcoat;
	float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	vec3 sheenColor;
#endif

};

#define MAXIMUM_SPECULAR_COEFFICIENT 0.16
#define DEFAULT_SPECULAR_COEFFICIENT 0.04

// Clear coat directional hemishperical reflectance (this approximation should be improved)
float clearcoatDHRApprox( const in float roughness, const in float dotNL ) {

	return DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );

}

	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
        
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.specularRoughness;

		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight; // counterclockwise; light shines in local neg z direction
		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;

		vec2 uv = LTC_Uv( normal, viewDir, roughness );

		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );

		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );

        float weightAdjustment = min(max(6.0 * roughness - 1.1, 0.0), 1.0);

		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords ) * weightAdjustment;

		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );

	}

void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	vec3 irradiance = dotNL * directLight.color;


	#ifdef CLEARCOAT

		float ccDotNL = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );

		vec3 ccIrradiance = ccDotNL * directLight.color;


		float clearcoatDHR = material.clearcoat * clearcoatDHRApprox( material.clearcoatRoughness, ccDotNL );

		reflectedLight.directSpecular += ccIrradiance * material.clearcoat * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.clearcoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearcoatRoughness );

	#else

		float clearcoatDHR = 0.0;

	#endif

	#ifdef USE_SHEEN
		reflectedLight.directSpecular += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Specular_Sheen(
			material.specularRoughness,
			directLight.direction,
			geometry,
			material.sheenColor
		);
	#else
	    vec3 specular = ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.normal, material.specularColor, material.specularRoughness);
		//specular *= magic1;
		reflectedLight.directSpecular += specular;
	#endif
	reflectedLight.directDiffuse += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
}

void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

}

void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {

	#ifdef CLEARCOAT

		float ccDotNV = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );

		reflectedLight.indirectSpecular += clearcoatRadiance * material.clearcoat * BRDF_Specular_GGX_Environment( geometry.viewDir, geometry.clearcoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearcoatRoughness );

		float ccDotNL = ccDotNV;
		float clearcoatDHR = material.clearcoat * clearcoatDHRApprox( material.clearcoatRoughness, ccDotNL );

	#else

		float clearcoatDHR = 0.0;

	#endif

	float clearcoatInv = 1.0 - clearcoatDHR;

	// Both indirect specular and indirect diffuse light accumulate here

	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;

	BRDF_Specular_Multiscattering_Environment( geometry, material.specularColor, material.specularRoughness, singleScattering, multiScattering );

	vec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );

	reflectedLight.indirectSpecular += clearcoatInv * radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;

	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;

}

#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical

// ref: https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {

	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );

}

#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );
		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
		bool frustumTest = all( frustumTestVec );
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ), 
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ), 
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif


	uniform sampler2D bumpMap;
	uniform float bumpScale;

	// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
	// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

	// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

	vec2 dHdxy_fwd() {

		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );

		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;

		return vec2( dBx, dBy );

	}

	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {

		// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

		vec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );
		vec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );
		vec3 vN = surf_norm;		// normalized

		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );

		float fDet = dot( vSigmaX, R1 ) * faceDirection;

		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );

	}


//#include <bumpmap_pars_fragment>
//#include <normalmap_pars_fragment>

uniform sampler2D normalMap;
uniform vec2 normalScale;

uniform mat3 normalMatrix;

	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {

		// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

		vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
		vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
		vec2 st0 = dFdx( normalMapUv.st );
		vec2 st1 = dFdy( normalMapUv.st );

		vec3 N = surf_norm; // normalized

		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );

		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;

		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );

		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );

	}

#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif
#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif
#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif

void main() {


#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif
    if (diffuseOnly){

		// tone it down a bit
		// threejs changed gamma handling, compensate for that here
        vec4 diffuseColor = vec4(diffuse * 0.25, 1.0);
		// vec4 diffuseColor = vec4(0.0, 0.0, 0.0, 1.0);
        

// these are basic map samplers with uv scaling and offsets and such if they are defined
vec4 texelColor;
if (tpmData.useTpmMap){
	texelColor = triplanar_mapping( map, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, mapTpmScale );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
	// debugColor = vec4(1.0, 0.0, 1.0, 1.0);
} else {
	texelColor = texture2D( map, vUv );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
}


        vec3 totalEmissiveRadiance = emissive * emissive2;
        

vec4 emissiveColor;
if (tpmData.useTpmEmissiveMap){
	emissiveColor = triplanar_mapping( emissiveMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, emissiveTpmScale );
	emissiveColor.rgb *= emissive2;
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	totalEmissiveRadiance *= emissiveColor.rgb;
	// debugColor = vec4(0.0, 0.0, 1.0, 1.0);
} else {
	emissiveColor = texture2D( emissiveMap, emissiveMapUv );
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	emissiveColor.rgb *= emissive2;
	totalEmissiveRadiance *= emissiveColor.rgb;
	//debugColor.y = 0.0;
}



        #ifdef USE_ALPHAMAP
            diffuseColor.a = texture2D( alphaMap, alphaMapUv ).g * opacity;
        #endif
        

float ambientOcclusion;
if (uv1AOMap){
	ambientOcclusion = ( texture2D( aoMap, vUv ).r - 1.0 ) * aoMapIntensity + 1.0;
} else {
	ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
}


        // not completely true for this, but we can bake in the lightmap and occlusion perhaps
        diffuseColor.rgb += totalEmissiveRadiance.rgb * emissive2;
        gl_FragColor = diffuseColor;

        // while not technically diffuse, we can jam in the lightmaps here for later use
        //vec3 lightSample = texture2D( lightMap, vUv2 ).rgb * lightMapIntensity;
        vec3 lightSample = lightMapTexelToLinear( texture2D( lightMap, vUv2 ) ).rgb * lightMapIntensity * 2.0;
        gl_FragColor.rgb *= lightSample.rgb * ambientOcclusion;
        //gl_FragColor.rgb = lightSample.rgb;
        //gl_FragColor.rgb = vec3(magic1);
        


if (tonemappingData.type == TONEMAP_LINEAR){

	gl_FragColor.rgb = LinearToneMapping(gl_FragColor.rgb, tonemappingData.exposure);

} else if (tonemappingData.type == TONEMAP_REINHARD){

	gl_FragColor.rgb = ReinhardToneMapping(gl_FragColor.rgb, tonemappingData.exposure);	

} else if (tonemappingData.type == TONEMAP_CINEON){

	gl_FragColor.rgb = OptimizedCineonToneMapping(gl_FragColor.rgb, tonemappingData.exposure);
	// debugColor.rgb = vec3(1.0, 0.0, 0.0);
	
} else if (tonemappingData.type == TONEMAP_ACES){

	gl_FragColor.rgb = ACESFilmicToneMapping(gl_FragColor.rgb, tonemappingData.exposure);
	
} else if (tonemappingData.type == TONEMAP_CUSTOM){

	gl_FragColor.rgb = LinearToneMapping(gl_FragColor.rgb, tonemappingData.exposure);
	
} else if (tonemappingData.type == TONEMAP_NONE){
	// just for debugging, could be removed
}



    } else if (emissionOnly){
        vec4 bloomSample = vec4(vec3(bloomIntensity), 1.0);
        // if and when needed, we can sample the emissionmap to have a stencil
        #ifdef USE_EMISSIVEMAP
            vec4 emissiveSample = texture2D( emissiveMap, emissiveMapUv );
			emissiveSample.rgb *= emissive2;
            bloomSample *= emissiveSample;
        #endif
        gl_FragColor = bloomSample;
    } else if (ormOnly){
        float roughnessFactor = roughness;
        float metalnessFactor = metalness;
        

float ambientOcclusion;
if (uv1AOMap){
	ambientOcclusion = ( texture2D( aoMap, vUv ).r - 1.0 ) * aoMapIntensity + 1.0;
} else {
	ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
}

        

vec4 texelRoughness;
if (tpmData.useTpmRoughnessMap){
	texelRoughness = triplanar_mapping( roughnessMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, roughnessTpmScale );
    roughnessFactor *= texelRoughness.g;
	// debugColor = vec4(0.0, roughnessTpmScale.x, roughnessTpmScale.y, 1.0);
	// debugColor = vec4(0.0, test.x, test.y, 1.0);
} else {
	texelRoughness = texture2D( roughnessMap, roughnessMapUv );
    // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
    roughnessFactor *= texelRoughness.g;
}


        

vec4 texelMetalness;
if (tpmData.useTpmMetalnessMap){
 	texelMetalness = triplanar_mapping( metalnessMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, metalnessTpmScale );
 	metalnessFactor *= texelMetalness.b;
	// debugColor = vec4(1.0, 0.0, 1.0, 1.0);
} else {
	texelMetalness = texture2D( metalnessMap, metalnessMapUv );	
	// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	metalnessFactor *= texelMetalness.b ;
}



        // check if we have emission, if so, slap the roughness up so it doesn't eat itself in reflection bounces
        vec3 totalEmissiveRadiance = emissive * emissive2;
        

vec4 emissiveColor;
if (tpmData.useTpmEmissiveMap){
	emissiveColor = triplanar_mapping( emissiveMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, emissiveTpmScale );
	emissiveColor.rgb *= emissive2;
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	totalEmissiveRadiance *= emissiveColor.rgb;
	// debugColor = vec4(0.0, 0.0, 1.0, 1.0);
} else {
	emissiveColor = texture2D( emissiveMap, emissiveMapUv );
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	emissiveColor.rgb *= emissive2;
	totalEmissiveRadiance *= emissiveColor.rgb;
	//debugColor.y = 0.0;
}



        float emissionMagnitude = totalEmissiveRadiance.r + totalEmissiveRadiance.g + totalEmissiveRadiance.b;
        emissionMagnitude /= 3.0;
        roughnessFactor = mix(roughnessFactor, 1.0, emissionMagnitude);

        float alpha = 1.0;
        #ifdef USE_ALPHAMAP
        alpha = texture2D( alphaMap, alphaMapUv ).g * opacity;
        #endif
        vec4 final = vec4(ambientOcclusion, roughnessFactor, metalnessFactor, alpha);
        #ifdef USE_ALPHAMAP
        //final.g = 0.0;
        #endif
        // orm: occlusion roughness metalness
        gl_FragColor = final;
    } else if (normalOnly){
        
float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
	vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;
        


if (use_bumpmap){
	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd(), faceDirection );
} else {

	#ifdef OBJECTSPACE_NORMALMAP

	if (tpmData.useTpmNormalMap)
		normal = triplanar_mapping( normalMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, tpmData.normalTpmScale ).xyz * 2.0 - 1.0;
	else {
		normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals
	}

	#ifdef FLIP_SIDED

		normal = - normal;

	#endif

	#ifdef DOUBLE_SIDED

		normal = normal * faceDirection;

	#endif

	normal = normalize( normalMatrix * normal );

#elif defined( TANGENTSPACE_NORMALMAP )


	vec3 mapN;
	if (tpmData.useTpmNormalMap)
		mapN = triplanar_mapping( normalMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, normalTpmScale ).xyz * 2.0 - 1.0;
	else {	
		mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals
	}
	
	mapN.xy *= normalScale;

	#ifdef USE_TANGENT

		normal = normalize( vTBN * mapN );

	#else

		normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );

	#endif

#endif
}

        float alpha = opacity;
        #ifdef USE_ALPHAMAP
            alpha = texture2D( alphaMap, alphaMapUv ).g;
        #endif
        vec3 normalSample = inverseTransformDirection( normalize( normal ), viewMatrix ) * 0.5 + 0.5;
        gl_FragColor = vec4(normalSample, alpha);        
    } else if (anisotropyDebug){
        vec4 noAnisoColor = vec4(1.0, 0.0, 0.0, 1.0);
        vec4 lowAnisoColor = vec4(0.0, 0.0, 1.0, 1.0);
        vec4 fullAnisoColor = vec4(0.0, 1.0, 0.0, 1.0);
        if (!anisotropicReflections){
            gl_FragColor = noAnisoColor;
        } else {
            gl_FragColor = mix(lowAnisoColor, fullAnisoColor, anisotropyStrength);
        }
        
    } else if (opacityToR){
        float alpha = opacity;
        #ifdef USE_ALPHAMAP
            alpha *= texture2D( alphaMap, alphaMapUv ).g;
        #endif
        //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_FragColor = vec4(1.0, 0.0, 0.0, alpha);
    } else {


        vec4 debugColor = vec4(1.0);

        vec3 totalEmissiveRadiance = emissive * emissive2;
        
	    vec4 diffuseColor = vec4( diffuse, opacity );
	    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	
        #ifdef USE_TRANSMISSION
            float totalTransmission = transmission;
            float thicknessFactor = thickness;
        #endif
        

        float metalnessFactor = metalness;
        float roughnessFactor = roughness;

#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif
        //#include <map_fragment>
#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif
        //#include <alphamap_fragment>
#ifdef ALPHATEST
	if ( diffuseColor.a < ALPHATEST ) discard;
#endif
        //#include <roughnessmap_fragment>
        //#include <metalnessmap_fragment>
float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
	vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;
        //#include <normal_fragment_maps>
        


if (use_bumpmap){
	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd(), faceDirection );
} else {

	#ifdef OBJECTSPACE_NORMALMAP

	if (tpmData.useTpmNormalMap)
		normal = triplanar_mapping( normalMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, tpmData.normalTpmScale ).xyz * 2.0 - 1.0;
	else {
		normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals
	}

	#ifdef FLIP_SIDED

		normal = - normal;

	#endif

	#ifdef DOUBLE_SIDED

		normal = normal * faceDirection;

	#endif

	normal = normalize( normalMatrix * normal );

#elif defined( TANGENTSPACE_NORMALMAP )


	vec3 mapN;
	if (tpmData.useTpmNormalMap)
		mapN = triplanar_mapping( normalMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, normalTpmScale ).xyz * 2.0 - 1.0;
	else {	
		mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals
	}
	
	mapN.xy *= normalScale;

	#ifdef USE_TANGENT

		normal = normalize( vTBN * mapN );

	#else

		normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );

	#endif

#endif
}

#ifdef CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif
        //#include <emissivemap_fragment>
#ifdef USE_TRANSMISSION
	#ifdef USE_TRANSMISSIONMAP
		totalTransmission *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSNMAP
		thicknessFactor *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition.xyz / vWorldPosition.w;
	vec3 v = normalize( cameraPosition - pos );
	vec3 viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
	float ior = ( 1.0 + 0.4 * reflectivity ) / ( 1.0 - 0.4 * reflectivity );
	vec3 f0 = vec3( pow( ior - 1.0, 2.0 ) / pow( ior + 1.0, 2.0 ) );
	vec3 f90 = vec3( 1.0 );
	vec3 f_transmission = totalTransmission * getIBLVolumeRefraction(
		normal, v, viewDir, roughnessFactor, diffuseColor.rgb, f0, f90,
		pos, modelMatrix, viewMatrix, projectionMatrix, ior, thicknessFactor,
		attenuationColor, attenuationDistance);
	diffuseColor.rgb = mix( diffuseColor.rgb, f_transmission, totalTransmission );
#endif

        



// these are basic map samplers with uv scaling and offsets and such if they are defined
vec4 texelColor;
if (tpmData.useTpmMap){
	texelColor = triplanar_mapping( map, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, mapTpmScale );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
	// debugColor = vec4(1.0, 0.0, 1.0, 1.0);
} else {
	texelColor = texture2D( map, vUv );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
}




vec4 texelMetalness;
if (tpmData.useTpmMetalnessMap){
 	texelMetalness = triplanar_mapping( metalnessMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, metalnessTpmScale );
 	metalnessFactor *= texelMetalness.b;
	// debugColor = vec4(1.0, 0.0, 1.0, 1.0);
} else {
	texelMetalness = texture2D( metalnessMap, metalnessMapUv );	
	// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	metalnessFactor *= texelMetalness.b ;
}




vec4 texelRoughness;
if (tpmData.useTpmRoughnessMap){
	texelRoughness = triplanar_mapping( roughnessMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, roughnessTpmScale );
    roughnessFactor *= texelRoughness.g;
	// debugColor = vec4(0.0, roughnessTpmScale.x, roughnessTpmScale.y, 1.0);
	// debugColor = vec4(0.0, test.x, test.y, 1.0);
} else {
	texelRoughness = texture2D( roughnessMap, roughnessMapUv );
    // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
    roughnessFactor *= texelRoughness.g;
}




vec4 emissiveColor;
if (tpmData.useTpmEmissiveMap){
	emissiveColor = triplanar_mapping( emissiveMap, inverseTransformDirection( normalize( vNormal ), viewMatrix ), vWorldPosition, emissiveTpmScale );
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	emissiveColor.rgb *= emissive2;
	totalEmissiveRadiance *= emissiveColor.rgb;
	// debugColor = vec4(0.0, 0.0, 1.0, 1.0);
} else {
	emissiveColor = texture2D( emissiveMap, emissiveMapUv );
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	emissiveColor.rgb *= emissive2;
	totalEmissiveRadiance *= emissiveColor.rgb;
	//debugColor.y = 0.0;
}




#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, alphaMapUv ).g;
#endif



// #ifdef IRIDESCENT
${IridescenceSampler}
// #endif
        // accumulation
        // rawDiffuseColor *= diffuseColor;

        // #include <lights_physical_fragment>

        
PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );

vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );

material.specularRoughness = max( roughnessFactor, 0.0525 );// 0.0525 corresponds to the base mip of a 256 cubemap.
material.specularRoughness += geometryRoughness;
material.specularRoughness = min( material.specularRoughness, 1.0 );

#ifdef REFLECTIVITY

	material.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );

	// lighten the speculars a bit?
	material.specularColor *= (metalnessFactor - material.specularRoughness * -2.0);

#else

	material.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );

#endif

#ifdef CLEARCOAT

	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;

	#ifdef USE_CLEARCOATMAP

		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;

	#endif

	#ifdef USE_CLEARCOAT_ROUGHNESSMAP

		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;

	#endif

	material.clearcoat = saturate( material.clearcoat ); // Burley clearcoat model
	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );

#endif

#ifdef USE_SHEEN

	material.sheenColor = sheen;

#endif

        //#include <lights_fragment_begin>
        
/**
 * This is a template that can be used to light a material, it uses pluggable
 * RenderEquations (RE)for specific lighting scenarios.
 *
 * Instructions for use:
 * - Ensure that both RE_Direct, RE_IndirectDiffuse and RE_IndirectSpecular are defined
 * - If you have defined an RE_IndirectSpecular, you need to also provide a Material_LightProbeLOD. <---- ???
 * - Create a material parameter that is to be passed as the third parameter to your lighting functions.
 *
 * TODO:
 * - Add area light support.
 * - Add sphere light support.
 * - Add diffuse light probe (irradiance cubemap) support.
 */

GeometricContext geometry;

geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

#ifdef CLEARCOAT

	geometry.clearcoatNormal = clearcoatNormal;

#endif

IncidentLight directLight;

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		pointLight = pointLights[ i ];

		getPointDirectLightIrradiance( pointLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

	SpotLight spotLight;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif

	for ( int i = 0; i < numOfSpotlights; i ++ ) {

		spotLight = spotLights[ i ];

		getSpotDirectLightIrradiance( spotLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		directionalLight = directionalLights[ i ];

		getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

	RectAreaLight rectAreaLight;

	for ( int i = 0; i < numOfRectArealights; i ++ ) {

		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );

	}

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	irradiance += getLightProbeIrradiance( lightProbe, geometry );

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

		}
		#pragma unroll_loop_end

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );

#endif

        
#if defined( RE_IndirectDiffuse )

	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel= texture2D( lightMap, vUv2 );
		//lightMapTexel= vec4(1.0);
		vec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )

		
    if (!noEnvironmentMapping){
		iblIrradiance += getLightProbeIndirectIrradiance( /*lightProbe,*/ geometry, maxMipLevel );
	}

	//irradiance *= magic1;

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	if (!noEnvironmentMapping){
		radiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, geometry.normal, material.specularRoughness, maxMipLevel );
		//radiance *= metalness;
		//radiance *= magic1;
		#ifdef CLEARCOAT

			clearcoatRadiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness, maxMipLevel );

		#endif
	} else {
		radiance += vec3(1.0);
	}
#endif

        //#include <lights_fragment_maps>
#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif

        // modulation
        //#include <aomap_fragment>
        

#ifdef USE_AOMAP
	

float ambientOcclusion;
if (uv1AOMap){
	ambientOcclusion = ( texture2D( aoMap, vUv ).r - 1.0 ) * aoMapIntensity + 1.0;
} else {
	ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
}

	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );
	#endif
#endif


        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );

        


if (tonemappingData.type == TONEMAP_LINEAR){

	gl_FragColor.rgb = LinearToneMapping(gl_FragColor.rgb, tonemappingData.exposure);

} else if (tonemappingData.type == TONEMAP_REINHARD){

	gl_FragColor.rgb = ReinhardToneMapping(gl_FragColor.rgb, tonemappingData.exposure);	

} else if (tonemappingData.type == TONEMAP_CINEON){

	gl_FragColor.rgb = OptimizedCineonToneMapping(gl_FragColor.rgb, tonemappingData.exposure);
	// debugColor.rgb = vec3(1.0, 0.0, 0.0);
	
} else if (tonemappingData.type == TONEMAP_ACES){

	gl_FragColor.rgb = ACESFilmicToneMapping(gl_FragColor.rgb, tonemappingData.exposure);
	
} else if (tonemappingData.type == TONEMAP_CUSTOM){

	gl_FragColor.rgb = LinearToneMapping(gl_FragColor.rgb, tonemappingData.exposure);
	
} else if (tonemappingData.type == TONEMAP_NONE){
	// just for debugging, could be removed
}


        
gl_FragColor = linearToOutputTexel( gl_FragColor );
#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif
#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif
#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif

        // #ifdef USE_ANISOTROPIC_REFLECTIONS
        //     //debugColor.x = 0.0;
        // #endif

        
        // if (noEnvironmentMapping){
        //     debugColor = vec4(1.0, 0.0, 0.0, 1.0);
        // }

        //debugColor.xyz = inverseTransformDirection( normalize( normal ), viewMatrix );
        //gl_FragColor = debugColor;

        /*
        if (numOfSpotlights < 1){
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        } else if (numOfSpotlights > 0 && numOfSpotlights < 6){
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        } else {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        } */

		// gl_FragColor.rgb *= emissive2;
        
        
        // webgl2 could be able to do this magjick
        // gl_FragData[0] = gl_FragColor;
        // gl_FragData[1] = vec4(1.0, 0.0, 0.0, 1.0);

    }
}
`;