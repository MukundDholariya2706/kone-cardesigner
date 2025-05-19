export const DEFAULT_CAPTURE_LIGHTS = [
  {
    id: "LANDING_DEVICE_CAPTURE_LIGHTS-1",
    type: "RectAreaLight",
    ambient: 1,
    //carShape: "WIDE",
    color: 0xfffce5,
    component: "CL151",
    height: 100,
    intensity: 5,
    position: [-70, 100, 4],
    lookAt: [0, 100, 0],
    width: 80,  
    //showHelper: true
  }, 
  {
    id: "LANDING_DEVICE_CAPTURE_LIGHTS-2",
    type: "RectAreaLight",
    ambient: 1,
    //carShape: "WIDE",
    color: 0xFFFFFF,
    component: "CL151",
    height: 100,
    intensity: 5,
    position: [70, 100, 4],
    lookAt: [0, 100, 0],
    width: 80,  
    //showHelper: true
  }, 
  {
    id: "LANDING_DEVICE_CAPTURE_LIGHTS-3",
    type: "RectAreaLight",
    ambient: 0,
    carShape: "WIDE",
    color: 0xFFFFFF,
    component: "CL151",
    height: 35,
    width: 200,
    intensity: 0.4, //Light colors
    //intensity: 0.5, //Dark colors
    position: [-20, 0, 10],
    rotation: [0, 0, 1.1],
    //showHelper: true,
   }
];

export const COP_CAPTURE_LIGHTS = [
   {
    id: "COP_CAPTURE_LIGHTS-1",
    type: "RectAreaLight",
    ambient: 1,
    //carShape: "WIDE",
    color: 0xfffce5,
    component: "CL151",
    height: 300,
    intensity: 5,
    position: [-70, 100, 4],
    lookAt: [0, 100, 0],
    width: 80,  
    //showHelper: true
  }, 
   {
    id: "COP_CAPTURE_LIGHTS-2",
    type: "RectAreaLight",
    ambient: 1,
    //carShape: "WIDE",
    color: 0xFFFFFF,
    component: "CL151",
    height: 300,
    intensity: 5,
    position: [70, 100, 4],
    lookAt: [0, 100, 0],
    width: 80,  
    //showHelper: true
  }, 
  {
    id: "COP_CAPTURE_LIGHTS-3",
    type: "RectAreaLight",
    ambient: 0,
    carShape: "WIDE",
    color: 0xFFFFFF,
    component: "CL151",
    height: 100,
    width: 200,
    intensity: 0.19, //Light colors
    //intensity: 0.5, //Dark colors
    position: [-30, 170, 20],
    rotation: [0, 0, 1.1],
    //showHelper: true,
   } 

];

