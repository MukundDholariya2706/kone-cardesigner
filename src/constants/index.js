
export const DEFAULT_LIST_IMAGE_URL = "/thumbnails/default-list-image.png"

export const LOCAL_STORAGE_LANGUAGE = "language";
export const LOCAL_STORAGE_ROLE = "role";
export const LOCAL_STORAGE_LOCATION = "location";
export const LOCAL_STORAGE_PROJECT_LOCATION = "projectLocation";
export const LOCAL_STORAGE_DOCUMENT_LANGUAGE = "documentLanguage" // pdf document language
export const LOCAL_STORAGE_3D_QUALITY = "quality-3d" 
export const LOCAL_STORAGE_BUILDING_TYPE = "buildingType" 
export const LOCAL_STORAGE_CUSTOM_FINISHES = "customFinishes"
export const LOCAL_STORAGE_SHOW_MOBILE_AD = "showMobileAd"
export const LOCAL_STORAGE_SHARE_INFO_DIALOG_SHOWN = 'designShareInfoDialogShown'

// ReCaptcha actions
export const SHARE_DIALOG_ACTION = 'share_dialog_action'
export const CONTACT_ACTION = 'contact_action'
export const FEEDBACK_ACTION = 'feedback_action'
export const DOWNLOAD_PAGE_ACTION = 'download_page_action'
export const EDITOR_PAGE_ACTION = 'editor_page_action'
export const SAVE_PREDESIGN_ACTION = 'save_predesign_action'
export const SELECTION_PAGE_ACTION = 'selection_page_action'
export const PREDESIGNS_PAGE_ACTION = 'predesigns_page_action'

export const MATERIAL_CATEGORY_MASTER = "master"
export const MATERIAL_CATEGORY_ADJUSTMENT = "adjustment"
export const MATERIAL_CATEGORY_MESH = "mesh"

export const TEXTURE_TYPE_TEXTURE = "texture"
export const TEXTURE_TYPE_CUBE_TEXTURE = "cube"

export const MATERIAL_TYPE_STANDARD = "standard";
export const MATERIAL_TYPE_PBR = "pbr";
export const MATERIAL_TYPE_MIRROR = "mirror";

export const CAR_SHAPE_DEEP = "DEEP";
export const CAR_SHAPE_SQUARE = "SQUARE";
export const CAR_SHAPE_SQUARE_10_13_24 = "SQUARE_10_13_24";
export const CAR_SHAPE_WIDE = "WIDE";
export const CAR_SHAPE_WIDE_23_17_26 = "WIDE_23_17_26";
export const CAR_SHAPE_HOMELIFT_9_12_24 = "HOMELIFT_9_12_24";
export const CAR_SHAPE_DEEP_AU_14_20_24 = "DEEP_AU_14_20_24";
export const CAR_SHAPE_WIDE_AU_14_16_24 = "WIDE_AU_14_16_24";
export const CAR_SHAPE_NANOSPACE_11_10_21 = "NANOSPACE_11_10_21";
export const CAR_SHAPE_WIDE_ENA_19_16_24 = "WIDE_ENA_19_16_24";
export const CAR_SHAPE_WIDE_ENA_20_13_24 = "WIDE_ENA_20_13_24";
export const CAR_SHAPE_4500HMC_ENA_17_25_24 = "ENA_17_25_24_4500HMC";
export const CAR_SHAPE_INDIA_11_10_22 = "INDIA_11_10_22";
export const CAR_SHAPE_INDIA_11_13_22 = "INDIA_11_13_22";
export const CAR_SHAPE_INDIA_13_24_22 = "INDIA_13_24_22";
export const CAR_SHAPE_INDIA_16_15_22 = "INDIA_16_15_22";
export const CAR_SHAPE_INDIA_11_20_22 = "INDIA_11_20_22";
export const CAR_SHAPE_INDIA_16_13_22 = "INDIA_16_13_22";
export const CAR_SHAPE_INDIA_17_18_22 = "INDIA_17_18_22";
export const CAR_SHAPE_WIDE_16_20_24 = "WIDE_16_20_24";
export const CAR_SHAPE_TRANSYS_12_23_24 = "TRANSYS_12_23_24";
export const CAR_SHAPE_TRANSYS_12_26_24 = "TRANSYS_12_26_24";
export const CAR_SHAPE_TRANSYS_14_24_24 = "TRANSYS_14_24_24";
export const CAR_SHAPE_TRANSYS_15_27_24 = "TRANSYS_15_27_24";

export const OFFERING_INDIA = "India";
export const OFFERING_ENA = "ENA";
export const INDIA_PRODUCTS = ["i-monospace","i-minispace", "u-monospace", "u-minispace", "a-monospace"];
export const SEAT_IN_CX_PRODUCTS = ["transys-goods-eu", "transys-passenger-eu"];
// C wall 1 or 2 panels instead of 2 or 3 for SOC products.
export const PANELING_EXCEPTION_CAR_SHAPES = [ CAR_SHAPE_DEEP, CAR_SHAPE_SQUARE ]

export const ENV_DYNAMIC = "ENV";
export const ENV_CAR = "ENV_CAR";
export const ENV_LANDING = "ENV_LANDING";
export const ENV_IMAGE_CAPTURE = "ENV_IMAGE_CAPTURE";
export const ENV_SCENE = "ENV_SCENE";
export const DEFAULT_WHITE_TEXTURE_ID = "default_white";
export const DEFAULT_AMBIENT_OCCLUSION_TEXTURE_ID = "default_ao";
export const DEFAULT_LIGHTMAP_TEXTURE_ID = "default_lm";
export const DEFAULT_NORMALMAP_TEXTURE_ID = "default_nm";

export const CAR_SHAPES = [

  // ENV mappiin vaikuttavat mitat
  { id: CAR_SHAPE_DEEP, depth: 210, width: 110.062, height: 240, displayWidth: 1100 , displayDepth: 2100, displayUnit:'mm' },
  { id: CAR_SHAPE_SQUARE, depth: 140, width: 110.062, height: 240, displayWidth: 1100 , displayDepth: 1400, displayUnit:'mm' },
  { id: CAR_SHAPE_SQUARE_10_13_24, depth: 129.7, width: 99.9, height: 240, displayWidth: 1000 , displayDepth: 1300, displayUnit:'mm' },
  { id: CAR_SHAPE_WIDE, depth: 140, width: 159.954, height: 240, displayWidth: 1600 , displayDepth: 1400, displayUnit:'mm' },
  { id: CAR_SHAPE_WIDE_23_17_26, depth: 169.4, width: 234.95, height: 260, displayWidth: 2350 , displayDepth: 1700, displayUnit:'mm' },
  { id: CAR_SHAPE_HOMELIFT_9_12_24, depth: 120, width: 90, height: 240, displayWidth: 900 , displayDepth: 1200, displayUnit:'mm' },
  { id: CAR_SHAPE_DEEP_AU_14_20_24, depth: 200, width: 140, height: 240, displayWidth: 1400 , displayDepth: 2000, displayUnit:'mm' },
  { id: CAR_SHAPE_WIDE_AU_14_16_24, depth: 160, width: 140, height: 240, displayWidth: 1400 , displayDepth: 1600, displayUnit:'mm' },
  { id: CAR_SHAPE_NANOSPACE_11_10_21, depth: 100, width: 110, height: 215, displayWidth: 1100 , displayDepth: 1000, displayUnit:'mm' },
  { id: CAR_SHAPE_WIDE_ENA_19_16_24, depth: 168.0, width: 194.399, height: 240, displayWidth: 77.7 , displayDepth: 66.7, displayUnit:'"' },
  { id: CAR_SHAPE_WIDE_ENA_20_13_24, depth: 131.6, width: 203.0, height: 240, displayWidth: 81.0 , displayDepth: 52.5, displayUnit:'"' },
  { id: CAR_SHAPE_4500HMC_ENA_17_25_24, depth: 248.46, width: 170, height: 240, displayWidth: 67.2 , displayDepth: 97.9, displayUnit:'"' },
  { id: CAR_SHAPE_WIDE_16_20_24, depth: 200, width: 160, height: 240, displayWidth: 1600 , displayDepth: 2000, displayUnit:'mm' },

  { id: CAR_SHAPE_INDIA_11_10_22, depth: 100.018, width: 110.086, height: 220, displayWidth: 1000 , displayDepth: 1100, displayUnit:'mm' },
  { id: CAR_SHAPE_INDIA_11_13_22, depth: 130.018, width: 110.086, height: 220, displayWidth: 1000 , displayDepth: 1100, displayUnit:'mm' },
  { id: CAR_SHAPE_INDIA_16_15_22, depth: 150.018, width: 160.086, height: 220, displayWidth: 1000 , displayDepth: 1100, displayUnit:'mm' },
  { id: CAR_SHAPE_INDIA_11_20_22, depth: 200.049, width: 110.086, height: 220, displayWidth: 2000 , displayDepth: 1100, displayUnit:'mm' },
  { id: CAR_SHAPE_INDIA_16_13_22, depth: 135.049, width: 159.952, height: 220, displayWidth: 1600 , displayDepth: 1300, displayUnit:'mm' },
  { id: CAR_SHAPE_INDIA_13_24_22, depth: 240.018, width: 130.086, height: 220, displayWidth: 1300 , displayDepth: 2400, displayUnit:'mm' },
  { id: CAR_SHAPE_INDIA_17_18_22, depth: 170.018, width: 180.086, height: 220, displayWidth: 1800 , displayDepth: 1800, displayUnit:'mm' },

  { id: CAR_SHAPE_TRANSYS_12_23_24, depth: 230.0, width: 119.99, height: 240, displayWidth: 1200, displayDepth: 2300, displayUnit:'mm' },
  { id: CAR_SHAPE_TRANSYS_12_26_24, depth: 260.0, width: 119.99, height: 240, displayWidth: 1200, displayDepth: 2600, displayUnit:'mm' },
  { id: CAR_SHAPE_TRANSYS_14_24_24, depth: 240.0, width: 139.99, height: 240, displayWidth: 1400, displayDepth: 2400, displayUnit:'mm'  },
  { id: CAR_SHAPE_TRANSYS_15_27_24, depth: 270.0, width: 149.99, height: 240, displayWidth: 1500, displayDepth: 2700, displayUnit:'mm'  },

];

export const LANDING_CUBE_MAP_SIZE = [1112.051, 291.772, 426.0]
export const LANDING_CUBE_MAP_POSITION = [137.213, 142.301, 257.203]

export const COP_WALL_PADDING = 46.6;
export const BUFFER_RAIL_POSITIONS = [
  { id: 'HIGH', height: 80 },
  { id: 'MIDDLE', height: 55 },
  { id: 'LOW', height: 30 }
]

// Ordered by priority (i.e. what position to use for COP if desired position is not available)
export const ALL_POSSIBLE_COP_POSITIONS = [
  'BX',
  'DX',
  'B1',
  'B2',
  'D1',
  'D2',
  'A1',
  'A2',
  'C1',
  'C2'
]

export const SLINGPARTS = [
  'Glass_Shaft_Ceiling',
  'Glass_Shaft_Frame_A',
  'Glass_Shaft_Frame_B',
  'Glass_Shaft_Frame_C',
  'Glass_Shaft_Frame_D',

  'Glass_Shaft_Ceiling_Transys',
  'Glass_Shaft_Frame_A_Transys',
  'Glass_Shaft_Frame_B_Transys',
  'Glass_Shaft_Frame_C_Transys',
  'Glass_Shaft_Frame_D_Transys',

  'Glass_Shaft_Lift_Deep_Car',
  'Glass_Car_Sling_Bottom_Deep',
  'Glass_Car_Sling_Pullies_Deep',
  'Glass_Car_Sling_Springs_Deep',
  'Glass_Car_Sling_Top_Deep',
  'Glass_Car_Sling_Deep_B',
  'Glass_Car_Sling_Deep_D',

  'Glass_Shaft_Lift_Square_Car',
  'Glass_Car_Sling_Bottom_Square',
  'Glass_Car_Sling_Pullies_Square',
  'Glass_Car_Sling_Springs_Square',
  'Glass_Car_Sling_Top_Square',
  'Glass_Car_Sling_Square_B',
  'Glass_Car_Sling_Square_D',

  'Glass_Shaft_Lift_Wide_Car',
  'Glass_Car_Sling_Bottom_Wide',
  'Glass_Car_Sling_Pullies_Wide',
  'Glass_Car_Sling_Springs_Wide',
  'Glass_Car_Sling_Top_Wide',
  'Glass_Car_Sling_Wide_B',
  'Glass_Car_Sling_Wide_D',

  'Glass_Shaft_Lift_Deep_AU_Car',
  'Glass_Car_Sling_Bottom_Deep_AU',
  'Glass_Car_Sling_Pullies_Deep_AU',
  'Glass_Car_Sling_Springs_Deep_AU',
  'Glass_Car_Sling_Top_Deep_AU',
  'Glass_Car_Sling_Deep_AU_B',
  'Glass_Car_Sling_Deep_AU_D',
  
  'Glass_Shaft_Lift_Wide_AU_Car',
  'Glass_Car_Sling_Bottom_Wide_AU',
  'Glass_Car_Sling_Pullies_Wide_AU',
  'Glass_Car_Sling_Springs_Wide_AU',
  'Glass_Car_Sling_Top_Wide_AU',
  'Glass_Car_Sling_Wide_AU_B',
  'Glass_Car_Sling_Wide_AU_D',

  'Glass_Shaft_Lift_Transys_15_27_24_Car',
  'Glass_Car_Sling_Bottom_Transys_15_27_24',
  'Glass_Car_Sling_Pullies_Transys_15_27_24',
  'Glass_Car_Sling_Springs_Transys_15_27_24',
  'Glass_Car_Sling_Top_Transys_15_27_24',
  'Glass_Car_Sling_Transys_15_27_24_B',
  'Glass_Car_Sling_Transys_15_27_24_D',
]

export const AIR_PURIFIER_PARTS = [
  'Air_Purifier_Effect_HalfSphere',
]

export const ENDPIECE_REGULATION = "endPieceCWallRegulation";
export const BODY_REGULATION = "bodyCWallRegulation";
export const ENDPIECE = "endPiece";
export const ENDPIECE_CWALL = "endPieceCWall";
export const CORNER = "corner";
export const CORNER_REVERSE = "cornerReverse";
export const CORNER_START = "cornerStart";
export const CORNER_START_REVERSE = "cornerStartReverse";
export const CORNER_END = "cornerEnd";
export const FIXED_SIZE_HANDRAILS = ["HR60C"];
export const BODY = "body";
export const MIDDLE = "middle";
export const FIXING = "fixing";
export const CORNER_START_NOFIXING = "cornerStartNoFixing";
export const CORNER_START_NOFIXING_REVERSE = "cornerStartNoFixingReverse";
export const GAP = "gap";
export const LIST = "list";
export const ENDPIECE_CWALL_FHT = "endPieceCWallFHT";
export const CORNER_END_FHT = "cornerEndFHT";
export const BODY_FHT = "bodyFHT";

export const GLASS_C_FHT = "GLASS_C_FHT"
export const GLASS_C_FHT_HERMES = "GLASS_C_FHT_HERMES"
export const GLASS_COMPONENTS = ["GLASS_C_PH","GLASS_C_FH","GLASS_C_FHT"]
export const WALLC = "WALLC"
export const WALLA = "WALLA"
export const WALLB = "WALLB"
export const WALLD = "WALLD"

export const HORIZONTAL = 'HOR';
export const VERTICAL = 'VER';

export const HORIZONTAL_PANELING_ONLY = ['add-on-deco', 'nanospace', 'minispace-upg-gcn', 'minispace-upg-exp', 'monospace-upg-gcn', 'monospace-upg-exp',]

export const ANTIFINGERPRINT = 'ANTIFINGERPRINTSS'
export const STEEL = 'STEEL'

export const CAR_TYPE_NORMAL = "SINGLE";
export const CAR_TYPE_TTC = "TTC";
export const CAR_TYPE_TTC_ENA = "TTC_ENA";
export const CAR_TYPE_GLASS_BACKWALL = "GLASS";
export const CAR_TYPE_GLASSMATERIAL_BACKWALL = "GLASSMATERIAL";
export const CAR_TYPE_TRUE_TYPES = [CAR_TYPE_TTC, CAR_TYPE_TTC_ENA];

export const GLASS_C_PIT = "GLASS_C_PIT";
export const GLASS_C_CITY = "GLASS_C_CITY";

export const DECO_GLASS_MATERIAL = "DECOGLASS";
export const GLASS_WALL_MATERIAL = "GLASS";

export const WIDE_ANGLE_MIRROR = "WAM";

export const VIEW3D_MODE_CAR = "car";
export const VIEW3D_MODE_LANDING = "landing";

export const LAMINATE_MATERIAL = "LAMINATES";
export const LAMINATELIST_WIDTH = 1;

export const ENA_LAMINATES = ["APPLIEDLAMINATES","RAISEDLAMINATES"]

export const DEFAULT_SKIRTING_COMPONENT = {
  componentType:'TYP_CAR_SKIRTING',
  component:'SK1',
  finishType:'MAT_CAR_SKIRTING',
  finish:'F'
}

export const DEFAULT_GLASS_WALL_FRAME = "GLASS_C_FRAME"
export const DEFAULT_GLASS_C_WALL = "GLASS_C_FHT"
export const DEFAULT_GLASS_C_WALL_HERMES = "GLASS_C_FHT_HERMES"
export const DEFAULT_HANDRAIL_FOR_GLASS_WALL = {
  componentType:'TYP_CAR_HANDRAIL',
  component:'HR81',
  finishType:'MAT_CAR_HANDRAIL',
  finish:'F',
  positions:["C"]
}

export const KTOC_LANDING_FLOOR = 'LANDING_FLOOR_KTOC';
export const KTOC_LANDING_WALL = 'LANDING_WALL_KTOC';

export const ELEVATOR_A = 'elevator-a';
export const ELEVATOR_B = 'elevator-b';

export const EXTRA_FEATURES = {
  SKIRTING_MANDATORY: 'skirting-mandatory',
  FULL_SCENIC_CAR: 'full-scenic-car',
  MANDATORY_PANEL_LISTS: 'mandatoryPanelLists',
  EMERGENCY_COMMUNICATIONS_247: '247-emergency-communications',
  NO_BLANK: 'no_blank',
  ENHANCE_LIGHT:'enhance_light',
}

export const ERROR_TYPES = {
  UNSUPPORTED_BROWSER: 'unsupported_browser',
  ERROR: 'error', // caught in try catch with some error handling logic
  FATAL: 'fatal', // application crashed because of unhandled error
}

export const SEPARATE_HALL_INDICATORS = ['KDS330']
export const COPS_WITH_KONE_INFORMATION = ['KSC738']

// Named position
export const TOP_CENTER = 'TOP_CENTER';
export const TOP_CENTER_FRAME = 'TOP_CENTER_FRAME';
export const TOP_LEFT = 'TOP_LEFT';
export const TOP_LEFT_FRAME = 'TOP_LEFT_FRAME';
export const TOP_RIGHT = 'TOP_RIGHT';
export const TOP_RIGHT_FRAME = 'TOP_RIGHT_FRAME';
export const MIDDLE_LEFT = 'MIDDLE_LEFT';
export const MIDDLE_LEFT_FRAME = 'MIDDLE_LEFT_FRAME';
export const MIDDLE_RIGHT = 'MIDDLE_RIGHT';
export const MIDDLE_RIGHT_FRAME = 'MIDDLE_RIGHT_FRAME';
export const MIDDLE_BETWEEN_DOORS = 'MIDDLE_BETWEEN_DOORS';

// edit view states
export const EDIT_VIEW_MODEL = "model-and-layout";
export const EDIT_VIEW_CEILING = "ceiling";
export const EDIT_VIEW_WALLS = "walls";
export const EDIT_VIEW_FLOOR = "floor";
export const EDIT_VIEW_DOORS = "car-doors";
export const EDIT_VIEW_ACCESORIES = "accessories";
export const EDIT_VIEW_SIGNALIZATION = "signalization";
export const EDIT_VIEW_SKIRTING = "skirtings";
export const EDIT_VIEW_HANDRAIL = "handrails";
export const EDIT_VIEW_BUFFER_RAIL = "buffer-rails";
export const EDIT_VIEW_LANDING = "landing";
export const EDIT_VIEW_LANDING_FINISHES = "landing-finishes";
export const EDIT_VIEW_SEAT = "seat";
export const EDIT_VIEW_MIRRORS = "mirrors";
export const EDIT_VIEW_TENANT_DIRECTORY = "tenant-directory";
export const EDIT_VIEW_INFO_MEDIA_SCREENS = "info-media-screens";
export const EDIT_VIEW_AIR_PURIFIER = "air-purifier";
export const EDIT_VIEW_DIGITAL_SERVICES = "digital-services";
export const EDIT_VIEW_CONNECTED_SERVICES = "connected-services";
export const EDIT_VIEW_ELEVATOR_MUSIC = "elevator-music";
export const EDIT_VIEW_ELEVATOR_CALL = "elevator-call";
export const EDIT_VIEW_ROBOT_API = "robot-api";
export const EDIT_VIEW_CUSTOM_FLOOR_FINISH = "custom-floor-finish";
export const EDIT_VIEW_CUSTOM_WALL_FINISH = "custom-wall-finish";
export const EDIT_VIEW_CUSTOM_LANDING_WALL_FINISH = "custom-landing-wall-finish";
export const EDIT_VIEW_CUSTOM_LANDING_FLOOR_FINISH = "custom-landing-floor-finish";
export const EDIT_VIEW_FLOOR_FINISH_MIXER = "floor-finish-mixer";

// Location selection views
export const MAP_VIEW = 'MAP_VIEW'
export const SELECT_REGION = 'SELECT_REGION'
export const SELECT_COUNTRY = 'SELECT_COUNTRY'

// Product family types

export const EXISTING_BUILDINGS = 'existing-buildings'
export const NEW_BUILDINGS = 'new-buildings'
export const MARINE = 'marine'

// component types
export const TYP_CAR_CEILING = "TYP_CAR_CEILING";
export const TYP_CAR_FLOORING = "TYP_CAR_FLOORING";
export const TYP_CAR_FLOORING_FRAME = "TYP_CAR_FLOORING_FRAME"; // <-- THIS IS JUST A GUESS
export const TYP_CAR_WALL_B = "TYP_CAR_WALL_B";
export const TYP_CAR_WALL_C = "TYP_CAR_WALL_C";
export const TYP_CAR_WALL_D = "TYP_CAR_WALL_D";
export const TYP_CAR_WALL_ADD_DECO_PACKAGE = "TYP_CAR_WALL_ADD_DECO_PACKAGE";
export const TYP_CAR_FRONT_WALL_A = "TYP_CAR_FRONT_WALL_A";
export const TYP_CAR_HANDRAIL = "TYP_CAR_HANDRAIL";
export const TYP_CAR_SKIRTING = "TYP_CAR_SKIRTING";
export const TYP_CAR_INFO_MEDIA_SCREENS = "TYP_CAR_INFO_MEDIA_SCREENS";
export const TYP_CAR_INFOSCREEN = "TYP_CAR_INFOSCREEN";
export const TYP_CAR_MEDIASCREEN = "TYP_CAR_MEDIASCREEN";
export const TYP_CAR_SEAT = "TYP_CAR_SEAT";
export const TYP_CAR_MIRROR = "TYP_CAR_MIRROR";
export const TYP_CAR_MIRROR_2 = "TYP_CAR_MIRROR_2";
export const TYP_CAR_TENANT_DIRECTORY = "TYP_TENANT_DIRECTORY_1";
export const TYP_CAR_BUFFER_RAIL = "TYP_CAR_BUFFER_RAIL";
export const TYP_DOOR_A = "TYP_DOOR_A";
export const TYP_DOOR_C = "TYP_DOOR_C";
export const TYP_CAR_GLASS_WALL_FRAME = "TYP_CAR_GLASS_WALL_FRAME";
export const TYP_CAR_GLASS_WALL_C = "TYP_CAR_GLASS_WALL_C";
export const TYP_CAR_GLASS_WALL_B = "TYP_CAR_GLASS_WALL_B";
export const TYP_CAR_GLASS_WALL_D = "TYP_CAR_GLASS_WALL_D";
export const TYP_CAR_GLASS_WALL_C_PIT = "TYP_CAR_GLASS_WALL_C_PIT";
export const TYP_CAR_GLASS_WALL_C_CITY = "TYP_CAR_GLASS_WALL_C_CITY";
export const TYP_COP_PRODUCT_1 = "TYP_COP_PRODUCT_1";
export const TYP_COP_2 = "TYP_COP_2";
export const TYP_COP_HORIZONTAL = "TYP_COP_HORIZONTAL";
export const TYP_COP_DISPLAY = "TYP_COP_DISPLAY";
export const COL_CPI_ILLUMINATION = "COL_CPI_ILLUMINATION";
export const TYP_HL_PRODUCT = "TYP_HL_PRODUCT"; // Hall lantern / indicator type at landing
export const TYP_HL_DISPLAY = "TYP_HL_DISPLAY"; // Hall lantern / indicator display
export const TYP_HI_PRODUCT = "TYP_HI_PRODUCT"; // Hall indicator type at landing, KDS330 specific only
export const TYP_HI_DISPLAY = "TYP_HI_DISPLAY"; // Hall indicator display, KDS330 specific only
export const TYP_HIB_PRODUCT = "TYP_HIB_PRODUCT"; // Floor indicator type at landing / ENA
export const TYP_LCS_PRODUCT = "TYP_LCS_PRODUCT"; // Landing call station product
export const TYP_LCI_DISPLAY = "TYP_LCI_DISPLAY"; // Landing call station display
export const TYP_FB = "TYP_FB"; // Foot button
export const DOOR_OPENING_TYPE = "DOOR_OPENING_TYPE"; //Landing door frame
export const TYP_LDO_FRAME_FRONT = "TYP_LDO_FRAME_FRONT"; //Landing door frame
export const TYP_CAR_LAMINATE_LIST = "TYP_CAR_LAMINATE_LIST";
export const TYP_EID_PRODUCT = "TYP_EID_PRODUCT"; // Elevatro identifier
export const TYP_DOP_PRODUCT = "TYP_DOP_PRODUCT";
export const TYP_DOP_DISPLAY = "TYP_DOP_DISPLAY";
export const TYP_DIN_PRODUCT = "TYP_DIN_PRODUCT"; // Dest. ind. product
export const TYP_DIN_DISPLAY = "TYP_DIN_DISPLAY"; // Dest. ind. product
export const TYP_CDL_PRODUCT = "TYP_CDL_PRODUCT"; // JAMB product
export const TYP_COP_NO_SMOKING_SIGN_REQ = "TYP_COP_NO_SMOKING_SIGN_REQ"; //No smoking icon COP loadplate

export const KCSM_AIR_PURIFIER = "KCSM_AIR_PURIFIER"; // air purifier
export const KCSM_MOBILE_ELEV_CALL = "KCSM_MOBILE_ELEV_CALL"; // elevator call
export const KCSM_APF_SERV_ROBOT_API = "KCSM_APF_SERV_ROBOT_API"; // robot api
export const KCSM_24_7_CONNECT = "KCSM_24_7_CONNECT"; // 24/7 connected services
export const KCSM_ELEV_MUSIC = "KCSM_ELEV_MUSIC"; // elevator music
export const KCSM_KONE_INFORMATION = "KCSM_APF_INFO_300"; // KONE information

export const TYP_LANDING_FLOOR = "TYP_LANDING_FLOOR";
export const TYP_LANDING_WALL = "TYP_LANDING_WALL";
export const TYP_LANDING_CEILING = "TYP_LANDING_CEILING";

// special types
export const TYP_CAR_LIGHT_CUBE = "TYP_CAR_LIGHT_CUBE";
export const ENHANCE_LIGHT = "ENHANCE_LIGHT";


// material types
export const MAT_CAR_CEILING = "MAT_CAR_CEILING";
export const MAT_CAR_FLOORING = "MAT_CAR_FLOORING";
export const MAT_CAR_FLOORING_LIST = "MAT_CAR_FLOORING_LIST";
export const MAT_CAR_WALL_FINISH_B = "MAT_CAR_WALL_FINISH_B";
export const MAT_CAR_WALL_FINISH_C = "MAT_CAR_WALL_FINISH_C";
export const MAT_CAR_WALL_FINISH_D = "MAT_CAR_WALL_FINISH_D";
export const MAT_CAR_WALL = "MAT_CAR_WALL";
export const MAT_CAR_FRONT_WALL_A = "MAT_CAR_FRONT_WALL_A";
export const MAT_CAR_HANDRAIL = "MAT_CAR_HANDRAIL";
export const MAT_CAR_SKIRTING = "MAT_CAR_SKIRTING";
export const MAT_CAR_SEAT = "COL_CAR_SEAT";
//export const MAT_CAR_SEAT = "MAT_CAR_SEAT";
export const MAT_CAR_MIRROR = "MAT_CAR_MIRROR";
export const MAT_CAR_TENANT_DIRECTORY = "MAT_TENANT_DIRECTORY";
export const MAT_CAR_MEDIASCREEN = "MAT_CAR_MEDIASCREEN";
export const MAT_CAR_BUFFER_RAIL = "MAT_CAR_BUFFER_RAIL_INSERT";
export const MAT_CDO_PANEL = "MAT_CDO_PANEL";
export const MAT_COP_FACE_PLATE_1 = "MAT_COP_FACE_PLATE_1";
export const TYP_COP_FACE_PLATE_PRINT_1 = "TYP_COP_FACE_PLATE_PRINT_1";
export const TYP_COP_CUSTOM_FACE_PLATE = "TYP_COP_CUSTOM_FACE_PLATE";
export const DOOR_FINISHING_A = "DOOR_FINISHING_A"; // <-- landing door material
export const MAT_LDO_FRAME = "MAT_LDO_FRAME"; // <-- landing frame material
export const MAT_CAR_LAMINATE_LIST = "MAT_CAR_LAMINATE_LIST"
// special materials
export const MAT_CAR_LIGHT_CUBE = "MAT_CAR_LIGHT_CUBE";
export const MAT_LANDING_FLOOR = "MAT_LANDING_FLOOR";
export const MAT_LANDING_WALL = "MAT_LANDING_WALL";
export const MAT_LANDING_CEILING = "MAT_LANDING_CEILING";

export const LANDING_FINISH_GROUP = "GROUP_LANDING" 

export const COL_CAR_CEILING_LIGHT = "COL_CAR_CEILING_LIGHT";
export const MAT_CAR_CEILING_PANEL_GRAPHIC = "MAT_CAR_CEILING_PANEL_GRAPHIC";

export const CAR_WALL_STRUCTURE_B1 = "CAR_WALL_STRUCTURE_B1";
export const CAR_WALL_STRUCTURE_BX = "CAR_WALL_STRUCTURE_BX";
export const CAR_WALL_STRUCTURE_B2 = "CAR_WALL_STRUCTURE_B2";
export const ONE_PANEL = '1panel'
export const TWO_PANELS = '2panels'
export const THREE_PANELS = '3panels'
export const TWO_PANELS_COMBINED = '2panelsCombined'
export const FIRST_TWO_PANELS = 'firstTwoPanels'
export const LAST_TWO_PANELS = 'lastTwoPanels'

export const VISION_PANEL_L = '_Vision_Panel_L'
export const VISION_PANEL_R = '_Vision_Panel_R'
export const VISION_PANEL_B = '_Vision_Panel_B'

export const CAR_WALL_STRUCTURE_C1 = "CAR_WALL_STRUCTURE_C1";
export const CAR_WALL_STRUCTURE_CX = "CAR_WALL_STRUCTURE_CX";
export const CAR_WALL_STRUCTURE_C2 = "CAR_WALL_STRUCTURE_C2";

export const CAR_WALL_STRUCTURE_D1 = "CAR_WALL_STRUCTURE_D1";
export const CAR_WALL_STRUCTURE_DX = "CAR_WALL_STRUCTURE_DX";
export const CAR_WALL_STRUCTURE_D2 = "CAR_WALL_STRUCTURE_D2";

export const SIDE_WALL_PANELS_ID = 'SIDE_WALL_PANELS_ID'
export const ALL_WALL_PANELS_ID = 'ALL_WALL_PANELS_ID'

// special components
export const COMPONENT_COP_NONE = "cop-none";
export const COMPONENT_CEILING_NONE = "ceiling-none";

// ceiling component categories
export const CEILING_INTEGRADED = "INTEGRATED_CL";
export const CEILING_SUSPENDED = "SUSPENDED_CL";
export const CEILING_VANDAL = "VANDALRESISTANT_CL";

// COP button constants
export const BUTTON_COLS = "BUTTON_COLS";
export const BUTTON_SHAPE = "BUTTON_SHAPE";
export const BUTTON_SHAPE_ROUND = "round";
export const BUTTON_SHAPE_SQUARE = "square";
export const BRAILLE = "BRAILLE";
export const BUTTON_COL_ONE = "ONE";
export const BUTTON_COL_TWO = "TWO";
export const BUTTON_COL_THREE = "THREE";
export const BUTTON_COL_OPTIONS = [BUTTON_COL_ONE, BUTTON_COL_TWO, BUTTON_COL_THREE];
export const BRAILLE_ON = "ON";
export const BRAILLE_OFF = "OFF";
export const BUTTON_FINISH = "BUTTON_FINISH";
export const BUTTON_ILLUMINATION = "BUTTON_ILLUMINATION";
export const BUTTON_MOUNTING = "BUTTON_MOUNTING";
export const GREEN_MAIN_FLOOR = "GREEN_MAIN_FLOOR";

// COP lens buttons
export const LENS_SHAPE = 'LENS_SHAPE'
export const LENS_SHAPE_ROUND = "Rounded";
export const LENS_SHAPE_SQUARE = "Square";





export const US_STATES = [
  {"name": "Alabama", "value": "AL"},
  {"name": "Alaska", "value": "AK"},
  {"name": "Arizona", "value": "AZ"},
  {"name": "Arkansas", "value": "AR"},
  {"name": "California", "value": "CA"},
  {"name": "Colorado", "value": "CO"},
  {"name": "Connecticut", "value": "CT"},
  {"name": "Delaware", "value": "DE"},
  {"name": "District Of Columbia", "value": "DC"},
  {"name": "Florida", "value": "FL"},
  {"name": "Georgia", "value": "GA"},
  {"name": "Hawaii", "value": "HI"},
  {"name": "Idaho", "value": "ID"},
  {"name": "Illinois", "value": "IL"},
  {"name": "Indiana", "value": "IN"},
  {"name": "Iowa", "value": "IA"},
  {"name": "Kansas", "value": "KS"},
  {"name": "Kentucky", "value": "KY"},
  {"name": "Louisiana", "value": "LA"},
  {"name": "Maine", "value": "ME"},
  {"name": "Maryland", "value": "MD"},
  {"name": "Massachusetts", "value": "MA"},
  {"name": "Michigan", "value": "MI"},
  {"name": "Minnesota", "value": "MN"},
  {"name": "Mississippi", "value": "MS"},
  {"name": "Missouri", "value": "MO"},
  {"name": "Montana", "value": "MT"},
  {"name": "Nebraska", "value": "NE"},
  {"name": "Nevada", "value": "NV"},
  {"name": "New Hampshire", "value": "NH"},
  {"name": "New Jersey", "value": "NJ"},
  {"name": "New Mexico", "value": "NM"},
  {"name": "New York", "value": "NY"},
  {"name": "North Carolina", "value": "NC"},
  {"name": "North Dakota", "value": "ND"},
  {"name": "Ohio", "value": "OH"},
  {"name": "Oklahoma", "value": "OK"},
  {"name": "Oregon", "value": "OR"},
  {"name": "Pennsylvania", "value": "PA"},
  {"name": "Rhode Island", "value": "RI"},
  {"name": "South Carolina", "value": "SC"},
  {"name": "South Dakota", "value": "SD"},
  {"name": "Tennessee", "value": "TN"},
  {"name": "Texas", "value": "TX"},
  {"name": "Utah", "value": "UT"},
  {"name": "Vermont", "value": "VT"},
  {"name": "Virginia", "value": "VA"},
  {"name": "Washington", "value": "WA"},
  {"name": "West Virginia", "value": "WV"},
  {"name": "Wisconsin", "value": "WI"},
  {"name": "Wyoming", "value": "WY"}
]

export const CA_PROV_TERR = [
  { "value": "AB", "name": "Alberta"},
  { "value": "BC", "name": "British Columbia"},
  { "value": "MB", "name": "Manitoba"},
  { "value": "NB", "name": "New Brunswick"},
  { "value": "NL", "name": "Newfoundland and Labrador"},
  { "value": "NS", "name": "Nova Scotia"},
  { "value": "NT", "name": "Northwest Territories"},
  { "value": "NU", "name": "Nunavut"},
  { "value": "ON", "name": "Ontario"},
  { "value": "PE", "name": "Prince Edward Island"},
  { "value": "QC", "name": "Québec"},
  { "value": "SK", "name": "Saskatchewan"},
  { "value": "YT", "name": "Yukon"}
]

export const ANALYTICS_OPTIONS = {
  "TYP_CAR_CEILING":{name:'Ceiling - Component', section:'Ceiling'},
  "TYP_CAR_WALL_ADD_DECO_PACKAGE":{name:'Wall - Deco Package', section:'Walls'},
  "TYP_CAR_HANDRAIL":{name:'Handrail - Component', section:'Accessories'},
  "TYP_CAR_SKIRTING":{name:'Skirting - Component', section:'Accessories'},
  "TYP_CAR_INFOSCREEN":{name:'Infoscreen - Component', section:'Accessories'},
  "TYP_CAR_MEDIASCREEN":{name:'Mediascreen - Component', section:'Accessories'},
  "TYP_CAR_SEAT":{name:'Seat - Component', section:'Accessories'},
  "TYP_CAR_MIRROR":{name:'Mirror - Component', section:'Accessories'},
  "TYP_TENANT_DIRECTORY_1":{name:'Tenant Directory - Component', section:'Accessories'},
  "TYP_CAR_BUFFER_RAIL":{name:'Buffer Rail - Component', section:'Accessories'},
  "TYP_DOOR_A":{name:'Door solution - A wall - Component', section:'Door'},
  "TYP_DOOR_C":{name:'Door solution - C wall - Component', section:'Door'},
  "TYP_CAR_GLASS_WALL_C":{name:'Scenic Back Wall - Component', section:'Layout'},
  "TYP_COP_PRODUCT_1":{name:'COP 1 - Component', section:'User Interface'},
  "TYP_COP_2":{name:'COP 2 - Component', section:'User Interface'},
  "TYP_HL_PRODUCT":{name:'Hall Indicator - Component', section:'User Interface'},
  "TYP_LCS_PRODUCT":{name:'Landing Call Station - Component', section:'User Interface'},
  "TYP_LDO_FRAME_FRONT":{name:'Landing Door Frame - Component', section:'Door'},
  "TYP_CAR_LAMINATE_LIST":{name:'Laminate List - Component', section:'Walls'},
  "TYP_EID_PRODUCT":{name:'Elevator Indicator - Component', section:'User Interface'},
  "TYP_DOP_PRODUCT":{name:'Destination Operating Panel - Component', section:'User Interface'},
  "TYP_DIN_PRODUCT":{name:'Destination Indicator - Component', section:'User Interface'},
  "MAT_CAR_CEILING":{name:'Ceiling - Finish', section:'Ceiling'},
  "MAT_CAR_FLOORING":{name:'Floor - Finish', section:'Floor'},
  "MAT_CAR_WALL_FINISH_B":{name:'Wall B - Finish', section:'Walls'},
  "MAT_CAR_WALL_FINISH_C":{name:'Wall C - Finish', section:'Walls'},
  "MAT_CAR_WALL_FINISH_D":{name:'Wall D - Finish', section:'Walls'},
  "MAT_CAR_WALL":{name:'Scenic Back Wall - Finish', section:'Walls'},
  "MAT_CAR_FRONT_WALL_A":{name:'Wall A - Finish', section:'Door'},
  "MAT_CAR_HANDRAIL":{name:'Handrail - Finish', section:'Accessories'},
  "MAT_CAR_SKIRTING":{name:'Skirting - Finish', section:'Accessories'},
  "COL_CAR_SEAT":{name:'Seat - Finish', section:'Accessories'},
  "MAT_CAR_MIRROR":{name:'Mirror - Finish', section:'Accessories'},
  "MAT_TENANT_DIRECTORY":{name:'Tenant Directory - Finish', section:'Accessories'},
  "MAT_CAR_BUFFER_RAIL_INSERT":{name:'Buffer Rail - Finish', section:'Accessories'},
  "MAT_CDO_PANEL":{name:'Door solution- Inside - Finish', section:'Door'},
  "MAT_COP_FACE_PLATE_1":{name:'Signalization - Finish', section:'User Interface'},
  "TYP_COP_FACE_PLATE_PRINT_1":{name:'Signalization - Finish', section:'User Interface'},
  "TYP_COP_CUSTOM_FACE_PLATE":{name:'Signalization - Finish', section:'User Interface'},
  "MAT_LDO_FRAME":{name:'Door Solution - Outside - Finish', section:'Door'},
  "LANDING_FINISHES":{name:'Landing finishes - Outside - Finish group', section:'Landing'},
   
}

export const SNAPSHOT_DIMENSIONS = {
  DEEP: {
    carImages: {
      angleViewWidth:510,
      angleViewHeight:780,
      frontViewWidth:350,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -310,
      zPos: 200,
      pointToZ: -210/2, // -shape.depth/2+10
      targetZFix: 12,
    },
    ceilingImage: {
      width: 450,
      height:110,
      distanceFromCar:180
    }
  },
  SQUARE: {
    carImages: {
      angleViewWidth:420,
      angleViewHeight:780,
      frontViewWidth:350,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -290,
      zPos: 225,
      pointToZ: -140/2, // -shape.depth/2
      targetZFix: 3,
    },
    ceilingImage: {
      width: 450,
      height:98,
      distanceFromCar:160
    }
  },
  SQUARE_10_13_24: {
    carImages: {
      angleViewWidth:420,
      angleViewHeight:780,
      frontViewWidth:350,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -290,
      zPos: 225,
      pointToZ: -130/2, // -shape.depth/2
      targetZFix: 3,
    },
    ceilingImage: {
      width: 450,
      height:98,
      distanceFromCar:160
    }
  },
  WIDE: {
    carImages: {
      angleViewWidth:594,
      angleViewHeight:950,
      frontViewWidth:592,
      frontViewHeight:900
    },
    angleViewCamera:{
      xPos: -304,
      zPos: 230,
      pointToZ: -140/2, // -shape.depth/2-5
      targetZFix: -3,
    },
    ceilingImage: {
      width: 680,
      height:100,
      distanceFromCar:160
    }
  },
  HOMELIFT_9_12_24: {
    carImages: {
      angleViewWidth:376,
      angleViewHeight:780,
      frontViewWidth:300,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -280,
      zPos: 220,
      pointToZ: -140/2, // -shape.depth/2
      targetZFix: 13
    },
    ceilingImage: {
      width: 450,
      height:110,
      distanceFromCar:150
    }
  },
  DEEP_AU_14_20_24: {
    carImages: {
      angleViewWidth:530,
      angleViewHeight:780,
      frontViewWidth:446,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -309,
      zPos: 214,
      pointToZ: -210/2, // -shape.depth/2+10
      targetZFix: 13,
    },
    ceilingImage: {
      width: 590,
      height:110,
      distanceFromCar:180
    }
  },
  WIDE_AU_14_16_24: {
    carImages: {
      angleViewWidth:584,
      angleViewHeight:930,
      frontViewWidth:520,
      frontViewHeight:900
    },
    angleViewCamera:{
      xPos: -298,
      zPos: 224,
      pointToZ: -140/2, // -shape.depth/2-5
      targetZFix: -7,
    },
    ceilingImage: {
      width: 600,
      height:110,
      distanceFromCar:176
    }
  },
  NANOSPACE_11_10_21: {
    carImages: {
      angleViewWidth:450,
      angleViewHeight:880,
      frontViewWidth:352,
      frontViewHeight:700
    },
    angleViewCamera:{
      xPos: -270,
      zPos: 200,
      pointToZ: -100/2, // -shape.depth/2
      targetZFix: -1.5,
    },
    ceilingImage: {
      width: 540,
      height:110,
      distanceFromCar:150
    }
  },
  WIDE_ENA_19_16_24: {
    carImages: {
      angleViewWidth:675,
      angleViewHeight:950,
      frontViewWidth:500,
      frontViewHeight:630
    },
    angleViewCamera:{
      xPos: -310,
      zPos: 240,
      pointToZ: -160/2, // -shape.depth/2-5
      targetZFix: -6.5,
    },
    ceilingImage: {
      width: 830,
      height:100,
      distanceFromCar:160
    }
  },
  WIDE_ENA_20_13_24: {
    carImages: {
      angleViewWidth:640,
      angleViewHeight:950,
      frontViewWidth:520,
      frontViewHeight:630
    },
    angleViewCamera:{
      xPos: -300,
      zPos: 255,
      pointToZ: -160/2, // -shape.depth/2-5
      targetZFix: 6
    },
    ceilingImage: {
      width: 820,
      height:90,
      distanceFromCar:150
    }
  },
  ENA_17_25_24_4500HMC: {
    carImages: {
      angleViewWidth:590,
      angleViewHeight:760,
      frontViewWidth:520,
      frontViewHeight:760
    },
    angleViewCamera:{
      xPos: -317,
      zPos: 220,
      pointToZ: -250/2, // -shape.depth/2+10
      targetZFix: 15,
    },
    ceilingImage: {
      width: 690,
      height:110,
      distanceFromCar:180
    }
  },
  INDIA_11_10_22: {
    carImages: {
      angleViewWidth:450,
      angleViewHeight:880,
      frontViewWidth:352,
      frontViewHeight:700
    },
    angleViewCamera:{
      xPos: -271,
      zPos: 202,
      pointToZ: -100/2, // -shape.depth/2
      targetZFix: -1.5,
    },
    ceilingImage: {
      width: 550,
      height:100,
      distanceFromCar:138
    }
  },
  INDIA_11_20_22: {
    carImages: {
      angleViewWidth:500,
      angleViewHeight:730,
      frontViewWidth:446,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -290,
      zPos: 182,
      pointToZ: -200/2, // -shape.depth/2+10
      targetZFix: 11,
    },
    ceilingImage: {
      width: 522,
      height:110,
      distanceFromCar:162
    }
  },
  INDIA_11_13_22:{
    carImages: {
      angleViewWidth:580,
      angleViewHeight:880,
      frontViewWidth:352,
      frontViewHeight:700
    },
    angleViewCamera:{
      xPos: -271,
      zPos: 202,
      pointToZ: -130/2 , // -shape.depth/2
      targetZFix: -1.5,
    },
    ceilingImage: {
      width: 550,
      height:100,
      distanceFromCar:138
    }
  },
  INDIA_13_24_22: {
    carImages: {
      angleViewWidth:530,
      angleViewHeight:780,
      frontViewWidth:446,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -309,
      zPos: 214,
      pointToZ: -240/2, // -shape.depth/2+10
      targetZFix: 13,
    },
    ceilingImage: {
      width: 590,
      height:110,
      distanceFromCar:180
    }
  },
  INDIA_16_13_22: {
    carImages: {
      angleViewWidth:700,
      angleViewHeight:950,
      frontViewWidth:650,
      frontViewHeight:900
    },
    angleViewCamera:{
      xPos: -304,
      zPos: 230,
      pointToZ: -130/2-5, // -shape.depth/2-5
      targetZFix: -3,
    },
    ceilingImage: {
      width: 680,
      height:100,
      distanceFromCar:160
    }
  },
  TRANSYS_12_23_24: {
    carImages: {
      angleViewWidth:510,
      angleViewHeight:780,
      frontViewWidth:350,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -310,
      zPos: 200,
      pointToZ: -240/2, // -shape.depth/2+10
      targetZFix: 12,
    },
    ceilingImage: {
      width: 450,
      height:110,
      distanceFromCar:180
    }
  },
  INDIA_16_15_22: {
    carImages: {
      angleViewWidth:700,
      angleViewHeight:950,
      frontViewWidth:650,
      frontViewHeight:900
    },
    angleViewCamera:{
      xPos: -304,
      zPos: 230,
      pointToZ: -150/2, // -shape.depth/2-5
      targetZFix: -3,
    },
    ceilingImage: {
      width: 680,
      height:100,
      distanceFromCar:160
    }
  },
  TRANSYS_12_26_24: {
    carImages: {
      angleViewWidth:590,
      angleViewHeight:760,
      frontViewWidth:400,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -317, //camera pos left/right from 0
      zPos: 230, //camera pos distance from car
      pointToZ: -270/2, // -shape.depth/2
      targetZFix: 15, //camera target depth offset
    },
    ceilingImage: {
      width: 500,
      height:110,
      distanceFromCar:180
    }
  },
  TRANSYS_14_24_24: {
    carImages: {
      angleViewWidth:590,
      angleViewHeight:760,
      frontViewWidth:446,
      frontViewHeight:780
    },
    angleViewCamera:{
      xPos: -317, //camera pos left/right from 0
      zPos: 220, //camera pos distance from car
      pointToZ: -240/2, // -shape.depth/2
      targetZFix: 15, //camera target depth offset
    },
    ceilingImage: {
      width: 590,
      height:110,
      distanceFromCar:180
    }
  },
  TRANSYS_15_27_24: {
    carImages: {
      angleViewWidth:590,
      angleViewHeight:760,
      frontViewWidth:520,
      frontViewHeight:760
    },
    angleViewCamera:{
      xPos: -320, //camera pos left/right from 0
      zPos: 240, //camera pos distance from car
      pointToZ: -270/2, // -shape.depth/2
      targetZFix: 20, //camera target depth offset
    },
    ceilingImage: {
      width: 645,
      height:110,
      distanceFromCar:180
    }
  },
  WIDE_23_17_26: {
    carImages: {
      angleViewWidth:700,
      angleViewHeight:950,
      frontViewWidth:560,
      frontViewHeight:630
    },
    angleViewCamera:{
      xPos: -310,
      zPos: 290,
      pointToZ: -170/2, // -shape.depth/2-5
      targetZFix: -3
    },
    ceilingImage: {
      width: 820,
      height:90,
      distanceFromCar:180
    }
  },

}
