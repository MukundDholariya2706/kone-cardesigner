import "./DoorsEditor.scss";
import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import jsonLogic from "json-logic-js";

import { ProductContext } from "../../store/product/ProductProvider";
import { DesignContext } from "../../store/design/DesignProvider";
import { LayoutContext } from "../../store/layout/LayoutProvider";
import { Context3d } from "../../store/3d/shader-lib/Provider3d";
import { TranslationContext } from "../../store/translation/TranslationProvider";

import EditorLayout from '../EditorLayout';
import RadioButtonGroup from '../RadioButtonGroup';
import ThumbnailItem from '../ThumbnailItem';
import ImageTitle from '../ImageTitle';
import { 
  MAT_CDO_PANEL, TYP_DOOR_A, MAT_CAR_FRONT_WALL_A, TYP_DOOR_C, VIEW3D_MODE_CAR, VIEW3D_MODE_LANDING,
  MAT_LDO_FRAME, TYP_LDO_FRAME_FRONT, DOOR_FINISHING_A, TYP_COP_PRODUCT_1, MAT_CAR_WALL_FINISH_B,  CAR_TYPE_TTC, VISION_PANEL_L, VISION_PANEL_R, VISION_PANEL_B,
} from '../../constants';
import ToggleButtons from '../ToggleButtons';

import HeadingComponent from "../HeadingComponent/HeadingComponent";
import ListComponent from "../ListComponent";
import ScrollBox from "../ScrollBox";
import FinishAccordionItem from "../FinishAccordionItem";

import { isTrueTypeCar } from '../../utils/design-utils';
import SwitchButton from '../SwitchButton';
import InfoBox from '../InfoBox/InfoBox';
import WallItemSelector from '../WallItemSelector';
import FormSelect from '../FormSelect/FormSelect';
import { sortFinishes } from '../../utils/generalUtils'

const LEFT = "L";
const RIGHT = "R";
const SIDE_ID = "SIDE";

function getUnionForFinishes(finishes1 = [], finishes2 = []) {
  return finishes1.filter((finish) => {
    const found = finishes2.find((x) => x.id === finish.id);
    return !!found;
  });
}

/**
 * Compare items and return the one that is more similar with the current item
 * @param {*} items
 * @param {*} current
 * @returns best fitted item
 */
function findBestFit(items, current) {
  let bestFit = items[0];
  for (let i = 1; i < items.length; i++) {
    bestFit = pickBetterFit(items[i], bestFit, current);
  }
  return bestFit;
}

/**
 * Compare items a/b and return the one that is more similar with the current item
 * @param {*} a
 * @param {*} b
 * @param {*} current currently selected door component
 * @returns best fitted item
 */
function pickBetterFit(a, b, current) {
  if (a === current) return a;
  if (b === current) return b;

  // Assuming the second character of a door id is always R, L, or C.
  const side = current.id[1];
  const wide = current.id.includes("WIDE");
  const glass = current.id.includes("GLASS");
  const vision = current.id.includes("Vision");

  // side test
  if (a.id[1] === side && b.id[1] !== side) return a;
  if (a.id[1] !== side && b.id[1] === side) return b;

  // glass test
  if (a.id.includes("GLASS") === glass && b.id.includes("GLASS") !== glass)
    return a;
  if (a.id.includes("GLASS") !== glass && b.id.includes("GLASS") === glass)
    return b;

  // wide test
  if (a.id.includes("WIDE") === wide && b.id.includes("WIDE") !== wide)
    return a;
  if (a.id.includes("WIDE") !== wide && b.id.includes("WIDE") === wide)
    return b;

  // vision test
  if (a.id.includes("Vision") === vision && b.id.includes("Vision") !== vision)
    return a;
  if (a.id.includes("Vision") !== vision && b.id.includes("Vision") === vision)
    return b;

  return a;
}

/**
 * Returns best suited door components for radio button group
 * (one of each door type), based on current door selection
 *
 * @param {*} doors
 * @param {*} door currently selected door component
 * @returns door[]
 */
function getDoorTypes(doors, door) {
  const bestSuitedItems = {};

  for (let i = 0; i < doors.length; i++) {
    const item = doors[i];

    // Assuming the first character of a door id defines the door type
    const type = item.id[0];

    if (!bestSuitedItems.hasOwnProperty(type)) {
      bestSuitedItems[type] = item;
      continue;
    }

    bestSuitedItems[type] = pickBetterFit(bestSuitedItems[type], item, door);
  }

  return Object.keys(bestSuitedItems).map((key) => bestSuitedItems[key]);
}
/**
 * @returns [no_Vision_door, Vision_door] or null if there in no choice
 */
function getVisionDoorOption(doors, door) {
  const isVisionDoor = door.id.includes("Vision");
  if (isVisionDoor) {
    //return door;
    const filteredItems = doors.filter(
      (item) => !item.id.includes("Vision") && item.id[0] === door.id[0]
    );
    if (!filteredItems.length) {
      return null;
    }
    return [findBestFit(filteredItems, door), door];
  } else {
    const filteredItems = doors.filter(
      (item) => item.id.includes("Vision") && item.id[0] === door.id[0]
    );
    if (!filteredItems.length) {
      return null;
    }
    return [door, findBestFit(filteredItems, door)];
  }
}

/**
 * @returns [no_glass_door, glass_door] or null if there in no choice
 */
function getGlassOptions(doors, door) {
  const isGlassDoor = door.id.includes("GLASS");
  if (isGlassDoor) {
    const filteredItems = doors.filter(
      (item) => !item.id.includes("GLASS") && item.id[0] === door.id[0]
    );
    if (!filteredItems.length) {
      return null;
    }
    return [findBestFit(filteredItems, door), door];
  } else {
    const filteredItems = doors.filter(
      (item) => item.id.includes("GLASS") && item.id[0] === door.id[0]
    );
    if (!filteredItems.length) {
      return null;
    }
    return [door, findBestFit(filteredItems, door)];
  }
}

/**
 * @returns [no_wide_door, wide_door] or null if there in no choice
 */
function getWideOptions(doors, door) {
  const isWideDoor = door.id.includes("WIDE");
  if (isWideDoor) {
    const filteredItems = doors.filter(
      (item) => !item.id.includes("WIDE") && item.id[0] === door.id[0]
    );
    if (!filteredItems.length) {
      return null;
    }
    return [findBestFit(filteredItems, door), door];
  } else {
    const filteredItems = doors.filter(
      (item) => item.id.includes("WIDE") && item.id[0] === door.id[0]
    );
    if (!filteredItems.length) {
      return null;
    }
    return [door, findBestFit(filteredItems, door)];
  }
}

/**
 * @returns [left_door, right_door] or null if there in no choice
 */
function getSideOptions(doors, door) {
  const side = door.id[1];
  if (side !== RIGHT && side !== LEFT) {
    return null;
  }

  const filteredItems = doors.filter(
    (item) => item.id[1] !== side && item.id[0] === door.id[0]
  );
  if (!filteredItems.length) {
    return null;
  }

  if (side === RIGHT) {
    return [findBestFit(filteredItems, door), door];
  } else {
    return [door, findBestFit(filteredItems, door)];
  }
}

/**
 * DoorsEditor - UI for editing door type and finishes
 * @function DoorsEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const DoorsEditor = (props) => {
  const { getText } = useContext(TranslationContext);
  const {
    getComponent,
    setComponent,
    getDesignProperty,
    design,
    getFinishMaterial,
    setComponentFinish,
  } = useContext(DesignContext);
  const { product, getComponents } = useContext(ProductContext);
  const { view3dMode, setView3dMode } = useContext(LayoutContext);
  const { sceneManager } = useContext(Context3d);

  const [editingDoors, setEditingDoors] = useState([TYP_DOOR_A, TYP_DOOR_C]);
  const [editingFnish, setEditingFinish] = useState(null);

  // doors and frames never change after initialization.
  // Creating them as ref just to avoid unnecessarily
  // running getComponents on every render.
  const doorsRef = useRef(
    getComponents({
      type: TYP_DOOR_A,
      filteringOptions: {
        rule: "variousFilteringRules",
        test: {
          filteringRULE: "enaLargeCarDoorExceptions",
          PRODUCT: product.product,
          CARSHAPE: design?.carShape,
        },
      },
    })
  );
  const doors = doorsRef.current;

  const framesRef = useRef(getComponents({ type: TYP_LDO_FRAME_FRONT }));
  const frames = framesRef.current;

  const doorId = getComponent({ type: TYP_DOOR_A });
  const selectedDoor = (doors || []).find((item) => item.id === doorId) || {};
  const frame = getComponent({ type: TYP_LDO_FRAME_FRONT });
  const selectedFrame = (frames || []).find((item) => item.id === frame);

  const doorTypes = getDoorTypes(doors, selectedDoor);
  const glassOptions = getGlassOptions(doors, selectedDoor);
  const wideOptions = getWideOptions(doors, selectedDoor);
  const sideOptions = getSideOptions(doors, selectedDoor);
  const visionOptions = getVisionDoorOption(doors, selectedDoor);
  const [visionPanelToggleStatus, setVisionPanelToggleStats] = useState(false);

  const selectedDoorType = selectedDoor.id.substring(0, 2);
  const visionUI = ["1C", "2L", "2R"].includes(selectedDoorType);

  console.log("selected glass options........ ", visionOptions , 'vision ui option ', visionUI , ' door tyoe', selectedDoor.id);

  
  const singleFinishSelection = (product && product.rules && product.rules.doorAndWallSame && jsonLogic.apply(product.rules.doorAndWallSame,{RULE:'inside', PRODUCT:product.product})) ?true :false
  const singleFinishSelectionLanding = (product && product.rules && product.rules.doorAndWallSame && jsonLogic.apply(product.rules.doorAndWallSame,{RULE:'outside', PRODUCT:product.product, DOOR:(selectedDoor || {}).id})) ?true :false

  const { doorFinishes, frontWallFinishes, doorAndFrameFinishes: frameFinishes, landingDoorFinishes } = product.componentsData.doors


  // Only show finishes that exist in both lists. So if SS1 is enabled for landing door but disabled for the frame, the finish should not be shown for products that should use the same finish in both places.
  const doorAndWallFinishes = singleFinishSelection
    ? getUnionForFinishes(doorFinishes, frontWallFinishes)
    : null;
  const doorAndFrameFinishes = singleFinishSelectionLanding
    ? getUnionForFinishes(landingDoorFinishes, frameFinishes)
    : null;

  useMemo(() => {
    if (doorFinishes) return sortFinishes(doorFinishes);
  }, [doorFinishes]);

  useMemo(() => {
    if (doorAndFrameFinishes) return sortFinishes(doorAndFrameFinishes);
  }, [doorAndFrameFinishes]);

  const sigFamily =
    product.componentsData.signalization.copModels.find((item) => {
      return item?.copTypes?.find(
        (copItem) => copItem.id === getComponent({ type: TYP_COP_PRODUCT_1 })
      );
    }) || {};
  const aWallFinishByCOP =
    product?.rules?.variousFilteringRules &&
    jsonLogic.apply(product.rules.variousFilteringRules, {
      filteringRULE: "copHasSameFinishAsAWall",
      SIG_FAMILY: sigFamily.id,
      MARKET: product?.businessSpecification?.market,
      COP: getComponent({ type: TYP_COP_PRODUCT_1, justId: true }),
    });

  const wallItems = [
    {
      id: TYP_DOOR_A,
      label: getText("pdf-wall-a"),
      iconId: "icon-wall-a",
    },
    {
      id: TYP_DOOR_C,
      label: getText("ui-walls-c-wall"),
      iconId: "icon-wall-c",
    },
  ];

  const doorEditingOptions = [
    { value: "d0c1b0", text: getText("ui-edit-both-doors") },
    { value: "d0c1b1", text: getText("ui-edit-front-wall-door") },
    { value: "d0c0b1", text: getText("ui-edit-back-wall-door") },
  ];

  useEffect(() => {
    if (!sceneManager) return;

    if (view3dMode === VIEW3D_MODE_CAR) {
      sceneManager.lookAtWall("A");
    }

    const doorAIndex = design.components.findIndex(
      (item) => item.componentType === TYP_DOOR_A
    );
    const doorCIndex = design.components.findIndex(
      (item) => item.componentType === TYP_DOOR_C
    );
    if (doorAIndex !== -1 && doorCIndex !== -1) {
      if (
        design.components[doorAIndex].finish !==
        design.components[doorCIndex].finish
      ) {
        setEditingDoors([TYP_DOOR_A]);
      }
    }

    if (doorAIndex !== -1) {
      setEditingFinish(design.components[doorAIndex].finish);
    }
  }, []);

  useEffect(() => {
    if (product) {
      if (isTrueTypeCar(getDesignProperty("carType"))) {
        setComponent({ type: TYP_DOOR_C, component: doorId });
      }
    }
  }, [doorId]);

  const onChangeFrameHandler = (id) => {
    setComponent({ type: TYP_LDO_FRAME_FRONT, component: id });
  };

  const selectedEditingMode = useMemo(() => {
    const cDoorIsThere = editingDoors.indexOf(TYP_DOOR_C) !== -1;
    const aDoorIsThere = editingDoors.indexOf(TYP_DOOR_A) !== -1;
    if (cDoorIsThere && aDoorIsThere) {
      return "d0c1b0";
    } else if (cDoorIsThere && !aDoorIsThere) {
      return "d0c0b1";
    } else {
      return "d0c1b1";
    }
  }, [editingDoors]);

  const onChangeDoorSelectionHandler = (newEditOption) => {
    const doorAIndex = design.components.findIndex(
      (item) => item.componentType === TYP_DOOR_A
    );
    const doorCIndex = design.components.findIndex(
      (item) => item.componentType === TYP_DOOR_C
    );

    switch (newEditOption) {
      case "d0c1b0":
        setEditingDoors([TYP_DOOR_A, TYP_DOOR_C]);
        if (doorAIndex !== -1) {
          setEditingFinish(design.components[doorAIndex].finish);
        }

        // sceneManager.lookAtWall('A')
        break;

      case "d0c0b1":
        setEditingDoors([TYP_DOOR_C]);
        if (doorCIndex !== -1) {
          setEditingFinish(design.components[doorCIndex].finish);
        }
        sceneManager.lookAtWall("C");
        break;

      case "d0c1b1":
        setEditingDoors([TYP_DOOR_A]);
        if (doorAIndex !== -1) {
          setEditingFinish(design.components[doorAIndex].finish);
        }
        sceneManager.lookAtWall("A");
        break;

      default:
        console.log("This should not happen");
    }
  };

  const onChangeDoorFinishHandler = (newFinish) => {
    editingDoors.forEach((item) => {
      if (design.components.find((comp) => comp.componentType === item)) {
        setComponentFinish({ type: item, finish: newFinish });
      }
    });
    setEditingFinish(newFinish);
  };

  useEffect(() => {
    if (selectedDoor.id.includes("Vision"))
      {
        SetSelectedVisionID(selectedDoor.id.substring(2));
        setVisionPanelToggleStats(true);
      }
    else setVisionPanelToggleStats(false);
  }, [selectedDoor]);

  const onToggleVisionPanel = (e) => {
    setVisionPanelToggleStats(e);
    setComponent({
      type: TYP_DOOR_A,
      component: e ? visionOptions[1].id : visionOptions[0].id,
    });
    SetSelectedVisionID(visionOptions[1].id.substring(2));
  };
  const [selectedVisionID, SetSelectedVisionID] = useState(undefined);
  const onVisionPanelStyleSelection = (id) => {
    SetSelectedVisionID(id);
    let selectedComponent = selectedDoorType + id;
    console.log("vision", selectedComponent);
    setComponent({
      type: TYP_DOOR_A,
      component: selectedComponent,
    });
  };

  const renderVisionPanelSelector = () => {
    const items = [];

    items.push(
      {
        id: VISION_PANEL_L,
        label: getText("ui-left-panel"),
        iconId: "Doors-sel-left",
        disabled: false,
      },
      {
        id: VISION_PANEL_R,
        label: getText("ui-right-panels"),
        iconId: "Doors-sel-right",
        disabled: false,
      },
      {
        id: VISION_PANEL_B,
        label: getText("ui-both-panels"),
        iconId: "Doors-sel-both",
        disabled: false,
      }
    );

    return (
      <>
        <HeadingComponent
          heading={getText("ui-walls-sidewall-paneling")}
          info={getText("ui-walls-select-wall-i")} // TODO
          padding="sm"
          border="top"
        />
        <div>
          <WallItemSelector
            items={items}
            className="paneling-style-selector"
            onSelect={onVisionPanelStyleSelection}
            selectedId={selectedVisionID}
          />
        </div>
      </>
    );
  };

  return (
    <div className="DoorsEditor">
      <EditorLayout heading={getText("ui-door-heading")}>
        <ToggleButtons
          content={[
            { value: VIEW3D_MODE_CAR, label: getText("ui-general-inside") },
            {
              value: VIEW3D_MODE_LANDING,
              label: getText("ui-general-landing"),
            },
          ]}
          selectedButton={view3dMode}
          onChange={(e) => setView3dMode(e)}
        />

        <ScrollBox>
          <ListComponent>
            <HeadingComponent
              heading={getText("ui-door-solution")}
              info={getText("ui-door-solution-i")}
              padding="sm"
            />
            <ThumbnailItem
              image={(selectedDoor || {}).image}
              label={getText((selectedDoor || {}).description)}
            />
            <RadioButtonGroup
              selectionList={doorTypes.map((item) => ({
                ...item,
                // Assuming that character "_" in label separates extended door features like _GLASS & _WIDE
                // eg. component-2R_GLASS --> component-2SIDE
                label: item.label.split("_")[0].replace(/[RL]$/, SIDE_ID),
              }))}
              selectedId={selectedDoor.id}
              labelField="label"
              onChange={(id) =>
                setComponent({ type: TYP_DOOR_A, component: id })
              }
            />

            {glassOptions && (
              <>
                <HeadingComponent
                  heading={getText("ui-door-type")}
                  info={getText("ui-door-type-i")}
                  padding="sm"
                  border="top"
                />
                <SwitchButton
                  className="lowercase"
                  toggle={glassOptions[1] === selectedDoor}
                  label={getText("ui-door-glass")}
                  onChange={(e) =>
                    setComponent({
                      type: TYP_DOOR_A,
                      component: e ? glassOptions[1].id : glassOptions[0].id,
                    })
                  }
                />
              </>
            )}
            { visionOptions && visionUI &&  (
              <SwitchButton
                className="lowercase"
                toggle={visionPanelToggleStatus}
                label={getText("ui-vision-panel")}
                onChange={onToggleVisionPanel}
              />
            )}
            {visionUI && visionPanelToggleStatus && renderVisionPanelSelector()}

            {wideOptions && (
              <>
                <HeadingComponent
                  heading={getText("ui-door-width")}
                  info={getText("ui-door-width-i")}
                  padding="sm"
                  border="top"
                />
                <SwitchButton
                  className="lowercase"
                  toggle={wideOptions[1] === selectedDoor}
                  label={getText("ui-door-wide-opening")}
                  onChange={(e) =>
                    setComponent({
                      type: TYP_DOOR_A,
                      component: e ? wideOptions[1].id : wideOptions[0].id,
                    })
                  }
                />
                <InfoBox
                  className={"bottom-space-md"}
                  text={getText("ui-door-wide-opening-info")}
                />
              </>
            )}

            {/* { (design.carType === CAR_TYPE_TTC || design.carType === CAR_TYPE_TTC_ENA) && */}
            {design.carType === CAR_TYPE_TTC && !singleFinishSelection && (
              <>
                <HeadingComponent
                  heading={getText("ui-select-doors-to-edit")}
                  info={getText("ui-select-doors-to-edit-i")}
                  padding="sm"
                  border="top"
                />
                <WallItemSelector
                  items={wallItems}
                  notClickable={true}
                  selectedId={editingDoors}
                  locksType={"d0c1b0"}
                  showLockSymbols={selectedEditingMode === "d0c1b0"}
                  extra={
                    <div>
                      <FormSelect
                        onChange={(val) => onChangeDoorSelectionHandler(val)}
                        value={selectedEditingMode}
                        options={doorEditingOptions}
                      />
                    </div>
                  }
                />
              </>
            )}

            {view3dMode === VIEW3D_MODE_CAR && !singleFinishSelection && (
              <>
                <HeadingComponent
                  heading={getText("ui-door-finish")}
                  info={getText("ui-door-finish-i")}
                  padding="sm"
                  border="top"
                />
                <FinishAccordionItem
                  onChange={(val) => onChangeDoorFinishHandler(val)}
                  finish={editingFnish}
                  finishType={MAT_CDO_PANEL}
                  finishes={doorFinishes}
                  finishFilter={
                    product?.rules?.doorFinishes &&
                    ((item) => {
                      return jsonLogic.apply(product.rules.doorFinishes, {
                        PRODUCT: (product || {}).product,
                        DOOR: (selectedDoor || {}).id,
                        CARTYPE: getDesignProperty("carType"),
                        DOOR_FINISH: item.id,
                        REGULATIONS: getDesignProperty("regulations"),
                        DESIGN: design?.originalSapId,
                      });
                    })
                  }
                  disabled={
                    product?.rules?.variousFilteringRules &&
                    jsonLogic.apply(product.rules.variousFilteringRules, {
                      filteringRULE: "indiaDoorLocked",
                      PRODUCT: (product || {}).product,
                      DESIGN: design?.originalSapId,
                    })
                  }
                />
                {product?.businessSpecification?.market !== "ENA" && (
                  <>
                    <HeadingComponent
                      heading={getText("ui-door-front-wall-finish")}
                      info={getText("ui-door-front-wall-finish-i")}
                      padding="sm"
                      border="top"
                      className={aWallFinishByCOP ? "disabled" : ""}
                    />
                    <FinishAccordionItem
                      finishType={MAT_CAR_FRONT_WALL_A}
                      finishes={frontWallFinishes}
                      border="bottom"
                      disabled={
                        product?.rules?.variousFilteringRules &&
                        jsonLogic.apply(product.rules.variousFilteringRules, {
                          filteringRULE: "aWallFinishLocked",
                          PRODUCT: (product || {}).product,
                          DESIGN: design?.originalSapId,
                          MATERIAL: getFinishMaterial({
                            type: MAT_CAR_WALL_FINISH_B,
                          }),
                        })
                      }
                      className={aWallFinishByCOP ? "disabled" : ""}
                      finishFilter={
                        product?.rules?.variousFilteringRules &&
                        ((item) => {
                          return !jsonLogic.apply(
                            product.rules.variousFilteringRules,
                            {
                              filteringRULE: "indiaAWallException",
                              PRODUCT: (product || {}).product,
                              FINISH: item.id,
                              DESIGN: design?.originalSapId,
                            }
                          );
                        })
                      }
                    />
                  </>
                )}
              </>
            )}

            {view3dMode === VIEW3D_MODE_CAR && singleFinishSelection && (
              <>
                <HeadingComponent
                  heading={getText("ui-door-finish")}
                  info={getText("ui-door-finish-i")}
                  padding="sm"
                  border="top"
                />
                <FinishAccordionItem
                  finishType={[MAT_CDO_PANEL, MAT_CAR_FRONT_WALL_A]}
                  finishes={doorAndWallFinishes}
                  finishFilter={
                    product &&
                    product.rules &&
                    product.rules.doorFinishes &&
                    ((item) =>
                      jsonLogic.apply(product.rules.doorFinishes, {
                        PRODUCT: (design || {}).product,
                        DOOR: (selectedDoor || {}).id,
                        CARTYPE: getDesignProperty("carType"),
                        DOOR_FINISH: item.id,
                        REGULATIONS: getDesignProperty("regulations"),
                      }))
                  }
                />
              </>
            )}

            {view3dMode === VIEW3D_MODE_LANDING &&
              !singleFinishSelectionLanding && (
                <>
                  <HeadingComponent
                    heading={getText("ui-landing-door-finish")}
                    info={getText("ui-landing-door-finish-i")}
                    padding="sm"
                    border="top"
                  />
                  <FinishAccordionItem
                    finishType={DOOR_FINISHING_A}
                    finishes={landingDoorFinishes}
                    finishFilter={
                      product &&
                      product.rules &&
                      product.rules.doorFinishes &&
                      ((item) =>
                        jsonLogic.apply(product.rules.doorFinishes, {
                          PRODUCT: (design || {}).product,
                          DOOR: (selectedDoor || {}).id,
                          CARTYPE: getDesignProperty("carType"),
                          DOOR_FINISH: item.id,
                          REGULATIONS: getDesignProperty("regulations"),
                        }))
                    }
                    border="bottom"
                  />
                </>
              )}

            {view3dMode === VIEW3D_MODE_LANDING && (
              <>
                <HeadingComponent
                  heading={getText("ui-door-frame")}
                  info={getText("ui-door-frame-i")}
                  padding="sm"
                  border="top"
                />
                <ThumbnailItem
                  image={(selectedFrame || {}).image}
                  label={getText((selectedFrame || {}).description)}
                />
                <RadioButtonGroup
                  selectionList={frames}
                  selectedItem={selectedFrame}
                  descriptionField="label"
                  onChange={(id) => onChangeFrameHandler(id)}
                />
              </>
            )}

            {view3dMode === VIEW3D_MODE_LANDING &&
              !singleFinishSelectionLanding && (
                <>
                  <HeadingComponent
                    heading={getText("ui-landing-frame-finish")}
                    info={getText("ui-landing-frame-finish-i")}
                    padding="sm"
                    border="top"
                  />
                  <FinishAccordionItem
                    finishType={MAT_LDO_FRAME}
                    finishes={frameFinishes}
                    finishFilter={
                      product &&
                      product.rules &&
                      product.rules.doorFinishes &&
                      ((item) =>
                        jsonLogic.apply(product.rules.doorFinishes, {
                          PRODUCT: (design || {}).product,
                          DOOR: (selectedDoor || {}).id,
                          CARTYPE: getDesignProperty("carType"),
                          DOOR_FINISH: item.id,
                          REGULATIONS: getDesignProperty("regulations"),
                          ISFRAME: true,
                        }))
                    }
                    border="bottom"
                  />
                </>
              )}

            {view3dMode === VIEW3D_MODE_LANDING &&
              singleFinishSelectionLanding && (
                <>
                  <HeadingComponent
                    heading={getText("ui-door-frame-finish")}
                    info={getText("ui-door-frame-finish-i")}
                    padding="sm"
                    border="top"
                  />
                  <FinishAccordionItem
                    finishType={[DOOR_FINISHING_A, MAT_LDO_FRAME]}
                    finishes={doorAndFrameFinishes}
                    preferredFinishType={DOOR_FINISHING_A}
                    finishFilter={
                      product &&
                      product.rules &&
                      product.rules.doorFinishes &&
                      ((item) =>
                        jsonLogic.apply(product.rules.doorFinishes, {
                          PRODUCT: (design || {}).product,
                          DOOR: (selectedDoor || {}).id,
                          CARTYPE: getDesignProperty("carType"),
                          DOOR_FINISH: item.id,
                          REGULATIONS: getDesignProperty("regulations"),
                        }))
                    }
                    border="bottom"
                  />
                </>
              )}

            {sideOptions && (
              <>
                <HeadingComponent
                  heading={getText("ui-door-direction")}
                  info={getText("ui-door-direction-i")}
                  padding="sm"
                  border="top"
                />
                <ImageTitle
                  className="selection-list"
                  items={sideOptions.map((item, index) => ({
                    ...item,
                    image: index ? "icon-open-right" : "icon-open-left",
                    name: index
                      ? "ui-door-opening-direction-R"
                      : "ui-door-opening-direction-L",
                  }))}
                  icon={true}
                  selectedId={selectedDoor.id}
                  onChange={(id) =>
                    setComponent({ type: TYP_DOOR_A, component: id })
                  }
                />
              </>
            )}

            <div style={{ height: "20px" }} />
          </ListComponent>
        </ScrollBox>
      </EditorLayout>
    </div>
  );
};

export default DoorsEditor;
