import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import jsonLogic from 'json-logic-js';
import DropdownContainer, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import SectionAccordion from '../../../../components/SectionAccordion';
import { DesignContext } from '../../../../store/design/DesignProvider';
import { ProductContext } from '../../../../store/product/ProductProvider';
import { TranslationContext } from '../../../../store/translation/TranslationProvider';
import HeadingComponent from '../../../HeadingComponent/HeadingComponent';
import RadioButtonGroup from '../../../RadioButtonGroup';
import SwitchButton from '../../../SwitchButton';
import TextLine from '../../../TextLine';

import './EditButtonsSections.scss';
import { SignalizationContext } from '../../provider/SignalizationEditorProvider';
import {
  BRAILLE,
  BRAILLE_OFF,
  BRAILLE_ON,
  BUTTON_COLS,
  BUTTON_COL_ONE,
  BUTTON_SHAPE,
  BUTTON_SHAPE_ROUND,
  TYP_COP_PRODUCT_1,
  BUTTON_FINISH,
  BUTTON_ILLUMINATION,
  BUTTON_MOUNTING,
  GREEN_MAIN_FLOOR,
} from '../../../../constants';

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function EditButtonsSections(props) {
  const { className = '', lookAtCop } = props;

  const { design, setPart, getPart } = useContext(DesignContext);
  const productCtx = useContext(ProductContext);
  const { product, getFinish } = productCtx;
  const { getText } = useContext(TranslationContext);

  //   const getPart = ({ componentType, partType }) => {
  //   const setPart = ({ componentType, partType, component, finish }) => {

  const { firstCopId } = useContext(SignalizationContext);

  const [floorSet, setFloorSet] = useState();
  const [buttonShape, setButtonShape] = useState();
  const [buttonFinish, setButtonFinish] = useState(null);
  const [buttonFinishItem, setButtonFinishItem] = useState({ name: '', id: '' });
  const [toggle, setToggle] = useState();
  const [initialized, setInitialized] = useState(false);

  const finishDropDown = useRef(null)

  const buttonLighting = (getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_ILLUMINATION }) || {}).component
  const buttonMount = (getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_MOUNTING }) || {}).component
  const buttonGreenMain = (getPart({ componentType: TYP_COP_PRODUCT_1, partType: GREEN_MAIN_FLOOR }) || {}).component


  useEffect(() => {
    setInitialized(true)
  },[])

  const handleButtonsMenuOpen = (menuState) => {
    if (menuState) {
      lookAtCop();
    }
  };

  const [floorSelections, floorSelectionsWithBraille, buttonShapes, brailleInfo, buttonFinishesRaw, buttonFinishesBrailleRaw] = useMemo(() => {
    if (floorSet !== (getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_COLS }) || {}).component)
      setFloorSet(getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_COLS })?.component || BUTTON_COL_ONE);
    if (buttonShape !== (getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_SHAPE }) || {}).component)
      setButtonShape(getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_SHAPE })?.component || BUTTON_SHAPE_ROUND);
    if (toggle !== ((getPart({ componentType: TYP_COP_PRODUCT_1, partType: BRAILLE }) || {}).component === BRAILLE_ON ? true : false))
      setToggle((getPart({ componentType: TYP_COP_PRODUCT_1, partType: BRAILLE }) || {}).component === BRAILLE_ON ? true : false);
    if (buttonFinish !== (getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_SHAPE }) || {}).component) {
      const finishId = getPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_FINISH })?.component || 'none';
      setButtonFinish(finishId);
      if (finishId !== 'none') {
        const thisFinish = getFinish({ id: finishId });
        setButtonFinishItem(thisFinish);
      }
    }

    if (product?.rules?.buttonOptions) {
      const [floorDefinitions, buttonShapesBraille, buttonFinishes, buttonFinishesBraille] = jsonLogic.apply(product.rules.buttonOptions, {
        COP: firstCopId,
        REGULATIONS: design.regulations,
      });

      if (!floorDefinitions || floorDefinitions.length < 1) return [null, null, null, null];

      const floorSelectionOptions = [];
      const floorSelectionOptionsWithBraille = [];
      for (let i = 0; i < floorDefinitions.length; i++) {
        const startVal = i === 0 ? 2 : floorDefinitions[i - 1][1] + 1;
        const endVal = floorDefinitions[i][1];
        floorSelectionOptions.push({ name: `${startVal} - ${endVal}`, id: floorDefinitions[i][0] });
        if (floorDefinitions[i][2] !== true) {
          floorSelectionOptionsWithBraille.push({ name: `${startVal} - ${endVal}`, id: floorDefinitions[i][0] });
        }
      }

      const buttonShapeOptions = buttonShapesBraille.map((item) => {
        return { name: `ui-button-type-${item[0]}`, id: item[0] };
      });

      const brailleInfo = {};

      buttonShapesBraille.forEach((item) => {
        brailleInfo[item[0]] = item[1];
      });
      return [floorSelectionOptions, floorSelectionOptionsWithBraille, buttonShapeOptions, brailleInfo, buttonFinishes, buttonFinishesBraille];
    }

    return [null, null, null, null];
  }, [firstCopId, design, initialized]);

  const isBraille = useMemo(() => {
    if (!brailleInfo) return null;
    return brailleInfo[buttonShape];
  }, [buttonShape, initialized, brailleInfo]);

  const buttonFinishes = useMemo(() => {
    
    if (!buttonFinishesRaw) return null;
    if (!buttonFinishesBrailleRaw) return null;
    if (!buttonShape) return null;

    if (toggle) {
      if (Array.isArray(buttonFinishesBrailleRaw[0])) {
        const shapeFinishes = buttonFinishesBrailleRaw.find((item) => item[0] === buttonShape);
        return shapeFinishes[1];
      }
      return buttonFinishesBrailleRaw;
    } else {
      if (Array.isArray(buttonFinishesRaw[0])) {
        const shapeFinishes = buttonFinishesRaw.find((item) => item[0] === buttonShape);
        return shapeFinishes[1];
      }
      return buttonFinishesRaw;
    }
  }, [buttonShape, initialized, buttonFinishesRaw, buttonFinishesBrailleRaw]);

  if (brailleInfo === null) return null;

  // Blue section subheader
  function getDisplayedValue() {

    const shapeText = getText('ui-button-type-' + buttonShape)
    const brailleText = toggle ? (', ' + getText('ui-signalization-with-braille')) : ''
    const thisButtonFinish = getFinish({ id: buttonFinish })
    const buttonFinishText = thisButtonFinish ?', '+getText(thisButtonFinish.name) :''
    // CHECK can this happen? What then?
    return `${shapeText}${brailleText}${buttonFinishText}`;
  }

  const floorSetHandler = (id) => {
    // console.log(id)
    setFloorSet(id);
    setPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_COLS, component: id });
  };

  const brailleHandler = (e) => {
    setToggle(e);
    if (e) {
      setPart({ componentType: TYP_COP_PRODUCT_1, partType: BRAILLE, component: BRAILLE_ON });
    } else {
      setPart({ componentType: TYP_COP_PRODUCT_1, partType: BRAILLE, component: BRAILLE_OFF });
    }
  };

  const buttonShapeHandler = (id) => {
    setButtonShape(id);
    if (toggle && !brailleInfo[id]) {
      brailleHandler(false);
    }

    setPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_SHAPE, component: id });
  };

  const buttonFinishHandler = (id) => {
    finishDropDown.current.hide()
    setButtonFinish(id);
    const thisFinish = getFinish({ id });
    setButtonFinishItem(thisFinish);
    setPart({ componentType: TYP_COP_PRODUCT_1, partType: BUTTON_FINISH, component: id });
  };

  // active={showFinishes} onHide={ () => setShowFinishes(false)} onShow={ () => setShowFinishes(true)}
  // console.log({floorSelections,floorSelectionsWithBraille, isBraille, buttonShapes, buttonShape})
  // console.log({buttonFinishes,  isItTrue:(buttonFinishes.length > 0), buttonFinishItem})
  return (
    <div data-testid='EditButtonsSections' className={`EditButtonsSections ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-button-options')}
        displayedValue={getDisplayedValue()}
        accordionWasOpened={(val) => handleButtonsMenuOpen(val)}
      >
        <HeadingComponent heading={getText('ui-signalization-number-of-floors')} info={getText('ui-signalization-number-of-floors-i')} />
        <RadioButtonGroup
          selectionList={toggle ? floorSelectionsWithBraille : floorSelections}
          theme='white'
          selectedItem={{ id: floorSet }}
          labelField='name'
          onChange={(id) => floorSetHandler(id)}
        />

        <HeadingComponent heading={getText('ui-signalization-braille')} info={getText('ui-signalization-braille-i')} />
        <SwitchButton
          isDisabled={!isBraille}
          toggle={toggle}
          label={getText('ui-signalization-with-braille')}
          onChange={(e) => brailleHandler(e)}
          extraStyle={{ textTransform: 'unset' }}
        />

        {buttonShapes && buttonShapes.length > 1 && (
          <>
            <HeadingComponent heading={getText('ui-signalization-button-shape')} info={getText('ui-signalization-button-shape-i')} />
            <RadioButtonGroup
              selectionList={buttonShapes}
              theme='white'
              selectedItem={{ id: buttonShape }}
              labelField='name'
              onChange={(id) => buttonShapeHandler(id)}
            />
          </>
        )}

        { (buttonFinishes && buttonFinishes.length > 0 && buttonFinishItem) && (
          <>
            <HeadingComponent heading={getText('ui-signalization-button-finish')} info={getText('ui-signalization-button-finish-i')} />
            <DropdownContainer ref={finishDropDown}>
              <DropdownTrigger>
                {getText(buttonFinishItem.name)} ({buttonFinishItem.id})
              </DropdownTrigger>
              <div className='content-container'>
                <DropdownContent>
                  {buttonFinishes &&
                    buttonFinishes.map((item, index) => {
                      const thisFinish = getFinish({ id: item });
                      if (!thisFinish) return null;
                      return (
                        <div
                          key={'btnFinish'+index}
                          className={'finishItem' + (item === buttonFinish ? ' selected' : '')}
                          onClick={() => buttonFinishHandler(item)}
                        >
                          {getText(thisFinish.name)} ({thisFinish.id})
                        </div>
                      );
                    })}
                </DropdownContent>
              </div>
            </DropdownContainer>
          </>
        )}

        {design?.ktoc && (
          <>
            <HeadingComponent
              heading={getText('ui-signalization-additional-details')}
              info={getText('ui-signalization-additional-details-i')}
            />

            {buttonLighting &&
              <TextLine title={getText('ui-signalization-button-illumination')} value={getText(`ui-signalization-button-${buttonLighting}`)} />
            }

            {buttonGreenMain &&
              <TextLine title={getText('ui-signalization-button-green-main-floor')} value={getText(`ui-general-${buttonGreenMain}`)} />
            }

            {buttonMount &&
              <TextLine title={getText('ui-signalization-button-mounting')} value={getText(`ui-signalization-${buttonMount}`)} />
            }

          </>
        )}
      </SectionAccordion>
    </div>
  );
}

export default EditButtonsSections;
