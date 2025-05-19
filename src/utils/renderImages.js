import { CAR_SHAPES, SNAPSHOT_DIMENSIONS, TYP_COP_HORIZONTAL, TYP_COP_2, TYP_COP_PRODUCT_1, TYP_DIN_PRODUCT, TYP_DOP_PRODUCT, TYP_EID_PRODUCT, TYP_HL_PRODUCT, TYP_LCS_PRODUCT, VIEW3D_MODE_CAR, VIEW3D_MODE_LANDING, TYP_DOOR_A, TYP_HI_PRODUCT } from '../constants';
import { createCaptureBlueprintFilters } from '../store/blueprint/blueprint-utils';

const COP_IMAGE = 'copImage';
const HANDICAP_IMAGE = 'horizontalImage';
const HI_IMAGE = 'hiImage';
const HL_IMAGE = 'hlImage';
const LCS_IMAGE = 'lcsImage';
const EID_IMAGE = 'eidImage';
const DIN_IMAGE = 'dinImage';
const DOP_IMAGE = 'dopImage';
const FRONT_IMAGE = 'front';
const BACK_IMAGE = 'back';
const ANGLE_FRONT_IMAGE = 'angleFront';
const ANGLE_FRONT_OPPOSITE_IMAGE = 'angleFrontOpposite';
const ANGLE_BACK_IMAGE = 'angleBack';
const ANGLE_BACK_OPPOSITE_IMAGE = 'angleBackOpposite';
const CEILING_IMAGE = 'ceilingImg';
const LANDING_IMAGE = 'landing';
const GENDOC_LANDING_IMAGE = 'gendocLanding';
const LANDING_PDF_IMAGE = 'landingPdf';

export const IMAGE_IDS = {
  COP_IMAGE,
  HANDICAP_IMAGE,
  HI_IMAGE,
  HL_IMAGE,
  LCS_IMAGE,
  EID_IMAGE,
  DIN_IMAGE,
  DOP_IMAGE,
  FRONT_IMAGE,
  BACK_IMAGE,
  ANGLE_FRONT_IMAGE,
  ANGLE_FRONT_OPPOSITE_IMAGE,
  ANGLE_BACK_IMAGE,
  ANGLE_BACK_OPPOSITE_IMAGE,
  CEILING_IMAGE,
  LANDING_IMAGE,
  GENDOC_LANDING_IMAGE,
  LANDING_PDF_IMAGE,
};

function getUnneeded(neededImages) {
  // Get all images that have not been listed as 'needed' images
  return Object.values(IMAGE_IDS).filter(x => !neededImages.includes(x));
}

/**
 * 
 * @param {Object} args 
 * @param {Object} args.design 
 * @param {Object} args.product 
 * @param {Object} args.imageRenderer 
 * @param {Object} args.blueprintBuilder 
 * @param {boolean} args.hasHorizontalCop 
 * @param {string} args.quality 
 * @param {string[]=} args.unneededImages - specify what images should not be rendered (if empty, all are rendered)
 * @param {string[]=} args.neededImages - specify what images should be rendered. This is prioritized over unneededImages
 */
export async function renderImages({
  design,
  product,
  imageRenderer,
  blueprintBuilder,
  hasHorizontalCop,
  quality,
  unneededImages: origUnneeded = [],
  neededImages,
  resolutionMultiplier = 1,
}) {

  const shape = CAR_SHAPES.find(item => item.id === design.carShape);
  const snapShotValues = SNAPSHOT_DIMENSIONS[design.carShape];
  let carImages = {};
  let angleViewCamera = {};
  let ceilingImage = {};

  if (snapShotValues) {
    carImages = snapShotValues.carImages;
    angleViewCamera = snapShotValues.angleViewCamera;
    ceilingImage = snapShotValues.ceilingImage;
  }

  const standardImages = [FRONT_IMAGE, ANGLE_FRONT_IMAGE, ANGLE_BACK_IMAGE, ANGLE_BACK_OPPOSITE_IMAGE, ANGLE_FRONT_OPPOSITE_IMAGE, BACK_IMAGE, CEILING_IMAGE, COP_IMAGE, HANDICAP_IMAGE];
  const landingImages = [EID_IMAGE, DIN_IMAGE, LCS_IMAGE, HI_IMAGE, HL_IMAGE, DOP_IMAGE, LANDING_IMAGE, LANDING_PDF_IMAGE, GENDOC_LANDING_IMAGE];

  const unneededImages = Array.isArray(neededImages) ? getUnneeded(neededImages) : origUnneeded;

  const standardBPIsNeeded = standardImages.filter(x => !unneededImages.includes(x)).length > 0;

  const landingBPIsNeeded = landingImages.filter(x => !unneededImages.includes(x)).length > 0;

  const standardBP = standardBPIsNeeded && blueprintBuilder.build(design, { view: VIEW3D_MODE_CAR, userHasInteract: true, quality, hasHorizontalCop, product: product, removeSling: true, removeAirPurifierEffect: true });

  const standardBPLanding = landingBPIsNeeded && blueprintBuilder.build(design, { view: VIEW3D_MODE_LANDING, userHasInteract: true, quality, hasHorizontalCop, product: product });

  const copBP = !unneededImages.includes(COP_IMAGE)
    && createComponentBlueprint({ type: TYP_COP_PRODUCT_1, view: VIEW3D_MODE_CAR });

  const handcapType = design.components.find(item => item.componentType === TYP_COP_HORIZONTAL) ? TYP_COP_HORIZONTAL : TYP_COP_2;
  const handicapBP = !unneededImages.includes(HANDICAP_IMAGE)
    && removeHandrailPieces(createComponentBlueprint({ type: handcapType, view: VIEW3D_MODE_CAR }));

  const hiBP = !unneededImages.includes(HI_IMAGE)
    && createComponentBlueprint({ type: TYP_HI_PRODUCT, view: VIEW3D_MODE_LANDING });

  const hlBP = !unneededImages.includes(HL_IMAGE)
    && createComponentBlueprint({ type: TYP_HL_PRODUCT, view: VIEW3D_MODE_LANDING });

  const lcsBP = !unneededImages.includes(LCS_IMAGE)
    && removeFirefighterSymbol(createComponentBlueprint({ type: TYP_LCS_PRODUCT, view: VIEW3D_MODE_LANDING }));


  const eidBP = !unneededImages.includes(EID_IMAGE)
    && createComponentBlueprint({ type: TYP_EID_PRODUCT, view: VIEW3D_MODE_LANDING });

  const dinBP = !unneededImages.includes(DIN_IMAGE)
    && createComponentBlueprint({ type: TYP_DIN_PRODUCT, view: VIEW3D_MODE_LANDING });

  const dopBP = !unneededImages.includes(DOP_IMAGE)
    && createComponentBlueprint({ type: TYP_DOP_PRODUCT, view: VIEW3D_MODE_LANDING });

  const doorComponent = design.components.find(item => item.componentType === TYP_DOOR_A);
  const onePanelDoorAdjustment = (doorComponent?.component === '0L')
    ? -50
    : ((doorComponent?.component === '0R')
      ? 50
      : 0
    );

  let renderList = [];

  if (snapShotValues) {

    const lookOverCar = shape.height - (((shape.height - 40) * (shape.height - (shape.height - 40))) / (ceilingImage.distanceFromCar + shape.depth) + (shape.height - 40));
    const viewHeight = shape.height / 2;
    const camDist = shape.height + 70;
    renderList = [

      // capture examples ...
      // { id: 'angleFront', blueprint: copBP, focus: TYP_COP_PRODUCT_1, width: 1024, height: 1024, cameraNear: 20 },
      // { id: 'angleFront', blueprint: lcsBP, focus: TYP_LCS_PRODUCT, width: 1024, height: 1024, cameraNear: 20 },
      // { id: 'angleFront', blueprint: hlBP, focus: TYP_HL_PRODUCT, width: 1024, height: 1024, cameraNear: 20 },

      {
        id: FRONT_IMAGE, blueprint: standardBP,
        position: [0, viewHeight, camDist],
        target: [0, viewHeight, -shape.depth / 2],
        width: carImages.frontViewWidth,
        height: carImages.frontViewHeight,
        resolutionMultiplier,
      },
      {
        id: BACK_IMAGE,
        blueprint: standardBP,
        position: [0, viewHeight, -shape.depth - camDist],
        target: [0, viewHeight, -shape.depth / 2],
        width: carImages.frontViewWidth,
        height: carImages.frontViewHeight,
        resolutionMultiplier,
      },
      {
        id: ANGLE_FRONT_IMAGE,
        blueprint: standardBP,
        position: [angleViewCamera.xPos, viewHeight, angleViewCamera.zPos], target: [0, viewHeight, angleViewCamera.pointToZ + angleViewCamera.targetZFix],
        width: carImages.angleViewWidth,
        height: carImages.angleViewHeight,
        resolutionMultiplier,
      },
      {
        id: ANGLE_BACK_IMAGE,
        blueprint: standardBP,
        position: [-angleViewCamera.xPos, viewHeight, -angleViewCamera.zPos - shape.depth],
        target: [0, viewHeight, -shape.depth / 2 - angleViewCamera.targetZFix],
        width: carImages.angleViewWidth,
        height: carImages.angleViewHeight,
        resolutionMultiplier,
      },
      {
        id: ANGLE_FRONT_OPPOSITE_IMAGE,
        blueprint: standardBP,
        position: [-angleViewCamera.xPos, viewHeight, angleViewCamera.zPos], target: [0, viewHeight, angleViewCamera.pointToZ + angleViewCamera.targetZFix],
        width: carImages.angleViewWidth,
        height: carImages.angleViewHeight,
        resolutionMultiplier,
      },
      {
        id: ANGLE_BACK_OPPOSITE_IMAGE,
        blueprint: standardBP,
        position: [angleViewCamera.xPos, viewHeight, -angleViewCamera.zPos - shape.depth],
        target: [0, viewHeight, -shape.depth / 2 - angleViewCamera.targetZFix],
        width: carImages.angleViewWidth,
        height: carImages.angleViewHeight,
        resolutionMultiplier,
      },
      {
        id: CEILING_IMAGE,
        blueprint: standardBP,
        position: [0, (shape.height - 40), ceilingImage.distanceFromCar], target: [0, shape.height + lookOverCar, -shape.depth],
        width: ceilingImage.width,
        height: ceilingImage.height,
        fov: 8
      },
      {
        id: GENDOC_LANDING_IMAGE,
        blueprint: standardBPLanding,
        position: [134 * 2 + 10 + onePanelDoorAdjustment, 125, 410],
        target: [134 * 2 + 7 + onePanelDoorAdjustment, 140, 0],
        width: 1100 / 2,
        height: 552,
        resolutionMultiplier,
      },
      {
        id: LANDING_PDF_IMAGE,
        blueprint: standardBPLanding,
        position: [134 + onePanelDoorAdjustment, 120, 450],
        target: [134 + onePanelDoorAdjustment, 120, 0],
        width: 1200,
        height: 600,
        resolutionMultiplier,
      },
      {
        id: LANDING_IMAGE,
        blueprint: standardBPLanding,
        position: [134 + onePanelDoorAdjustment, 125, 550],
        target: [134 + onePanelDoorAdjustment, 125, 0],
        width: 810,
        height: 552,
        resolutionMultiplier,
      },
    ].filter(x => !unneededImages.includes(x.id));

    if (copBP) {
      renderList.push({ id: COP_IMAGE, blueprint: copBP, focus: TYP_COP_PRODUCT_1, width: 2000, height: 2000, cameraNear: 10 });
    }
    if (handicapBP) {
      renderList.push({ id: HANDICAP_IMAGE, blueprint: handicapBP, focus: handcapType, width: 2000, height: 2000, cameraNear: 10 });
    }
    if (hiBP) {
      renderList.push({ id: HI_IMAGE, blueprint: hiBP, focus: TYP_HI_PRODUCT, width: 2000, height: 2000, cameraNear: 10 });
    }
    if (hlBP) {
      renderList.push({ id: HL_IMAGE, blueprint: hlBP, focus: TYP_HL_PRODUCT, width: 2000, height: 2000, cameraNear: 5 });
    }
    if (lcsBP) {
      renderList.push({ id: LCS_IMAGE, blueprint: lcsBP, focus: TYP_LCS_PRODUCT, width: 2000, height: 2000, cameraNear: 5 });
    }
    if (eidBP) {
      renderList.push({ id: EID_IMAGE, blueprint: eidBP, focus: TYP_EID_PRODUCT, width: 2000, height: 2000, cameraNear: 20 });
    }
    if (dinBP) {
      renderList.push({ id: DIN_IMAGE, blueprint: dinBP, focus: TYP_DIN_PRODUCT, width: 2000, height: 2000, cameraNear: 10 });
    }
    if (dopBP) {
      renderList.push({ id: DOP_IMAGE, blueprint: dopBP, focus: TYP_DOP_PRODUCT, width: 2000, height: 2000, cameraNear: 20 });
    }
  }
  // Util for creating design gallery images

  /*      let renderList=[];
  
      const predesigns = product.designs;
      for(let i=32; i<predesigns.length;i++) {      
        // for(let i=24; i<32;i++) {      
          const curDesign = predesigns[i];
        // if(curDesign.carShape === 'INDIA_11_10_22') continue
        // if(
        //   curDesign.id !== 'IMNPS34' &&
        //   curDesign.id !== 'IMNPS35' &&
        //   curDesign.id !== 'IMNPS36' &&
        //   curDesign.id !== 'IMNSL32' &&
        //   curDesign.id !== 'IMNSE25' &&
        //   curDesign.id !== 'IMNSS22' &&
        //   curDesign.id !== 'IMNSS24' &&
        // ) continue;
  
        const snapShotValues = SNAPSHOT_DIMENSIONS[curDesign.carShape]
        const viewHeight = shape.height /2
        carImages=snapShotValues.carImages
        angleViewCamera=snapShotValues.angleViewCamera
        ceilingImage=snapShotValues.ceilingImage
  
        const curBP = blueprintBuilder.build(curDesign, { view: VIEW3D_MODE_CAR, userHasInteract:true, quality:'high', hasHorizontalCop:()=>{return false},product });
        renderList.push( { id: curDesign.image.url, blueprint: curBP, position: [angleViewCamera.xPos,viewHeight,angleViewCamera.zPos], target: [0, viewHeight, angleViewCamera.pointToZ + angleViewCamera.targetZFix], width: carImages.angleViewWidth, height: carImages.angleViewHeight } )
  //      renderList.push( { id: curDesign.id, blueprint: curBP, position: [angleViewCamera.xPos,107.5,angleViewCamera.zPos], target: [0, 107.5, angleViewCamera.pointToZ + angleViewCamera.targetZFix], width: carImages.angleViewWidth, height: carImages.angleViewHeight} )
      }   */

  // export this to be used for debugging?
  function createComponentBlueprint({ type, view }) {
    

    const foundInDesign = design.components
      .find(item => item.componentType === type) || null;

      console.log({type, foundInDesign})
    if(!foundInDesign) return null

    return blueprintBuilder.build(
      design,
      {
        view,
        userHasInteract: true,
        quality,
        hasHorizontalCop,
        product,
        ...createCaptureBlueprintFilters({ componentTypes: [type] })
      }
    );
   
  }

  function removeFirefighterSymbol(bp) {

    if (bp?.materials) {
      const lcsFss = bp.materials.filter(item => item.model === 'LCS_FSS');
      const materialsWithoutFss = bp.materials.filter(item => item.model !== 'LCS_FSS');

      if (lcsFss) {
        bp.materials = materialsWithoutFss;
        const meshesWithoutFss = bp.meshes.filter(item => item.name !== 'LCS_FSS');
        bp.meshes = meshesWithoutFss;
      }
    }

    return bp;
  }

  function removeHandrailPieces(bp) {
    if (bp?.meshes) {

      const filteredMeshes = bp.meshes.filter(mesh => mesh.name.indexOf('Handrail') === -1);

      bp.meshes = filteredMeshes;

      return bp;
    }

    return bp;
  }

  return new Promise((resolve, reject) => {

    const onComplete = (images) => {
      imageRenderer.removeListener('complete', onComplete);
      resolve(images);
    };

    imageRenderer.addListener('complete', onComplete);
    imageRenderer.renderImages(JSON.parse(JSON.stringify(renderList)));
  });
}

function getComponentFn(design, { type }) {
  if (!type || !design || !design.components) {
    return null;
  }
  const component = design.components
    .find(({ componentType }) => componentType === type);

  if (!component) {
    return null;
  }

  return component.component;
}


