import { DEFAULT_WHITE_TEXTURE_ID, DEFAULT_LIGHTMAP_TEXTURE_ID, ENV_CAR, DEFAULT_NORMALMAP_TEXTURE_ID } from '../../../constants';

export const mapTypes = [
  'alphaMap',
  'aoMap',
  'bumpMap',
  'displacementMap',
  'emissiveMap',    
  'lightMap',
  'map',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'envMap',
];

export const defaultMaps = [
  { type: 'map', id: DEFAULT_WHITE_TEXTURE_ID },
  { type: 'alphaMap', id: DEFAULT_WHITE_TEXTURE_ID },
  // { type: 'aoMap', id: DEFAULT_AMBIENT_OCCLUSION_TEXTURE_ID }, // the default AO was too dark
  { type: 'aoMap', id: DEFAULT_WHITE_TEXTURE_ID }, // the default AO was too dark
  { type: 'bumpMap', id: DEFAULT_LIGHTMAP_TEXTURE_ID },
  // { type: 'displacementMap', id: DEFAULT_WHITE_TEXTURE_ID }, // use this only if we start using displacement
  { type: 'emissiveMap', id: DEFAULT_WHITE_TEXTURE_ID },
  { type: 'lightMap', id: DEFAULT_LIGHTMAP_TEXTURE_ID },
  { type: 'metalnessMap', id: DEFAULT_WHITE_TEXTURE_ID },
  { type: 'normalMap', id: DEFAULT_NORMALMAP_TEXTURE_ID },
  { type: 'roughnessMap', id: DEFAULT_WHITE_TEXTURE_ID },
  { type: 'envMap', id: ENV_CAR },
]

export const materialPropertyTypes = [
  ...mapTypes,
  'color',
  'emissive',
  'colorWrite',
  'visible',
  'transparent',
  'depthWrite',
  'alphaTest',
  'refractionRatio',
  'bumpScale',
  'metalness',
  'roughness',
  'opacity',
  'reflectivity',
  'envMapIntensity',
  'emissiveIntensity',
  'lightMapIntensity',
  'blending',
  'blendEquation',
  'blendSrc',
  'blendDst',
  'normalScale',
  'textureRotation',
  'reflectivity',
  'clippingPlanes',
  'stencilWrite',
  'clearcoat',
  'clearcoatRoughness',
];