import React, { useState,  useContext, useMemo, useEffect } from 'react';
import SectionAccordion from '../../../SectionAccordion';
import { DesignContext } from '../../../../store/design';
import { TranslationContext } from '../../../../store/translation';
import HeadingComponent from '../../../HeadingComponent/HeadingComponent';
import RadioButtonGroup from '../../../RadioButtonGroup';
import './EditLensSections.scss';
import {
TYP_COP_PRODUCT_1,

} from '../../../../constants';

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function EditLensSections(props) {

  const { className = '' } = props;

  const {design, setPart, getPart, getComponent } = useContext(DesignContext);
  const { getText } = useContext(TranslationContext);
  const [lensShape, setLensShape] = useState(getPart({ componentType: TYP_COP_PRODUCT_1, partType: 'LENS'}) || 'round');
  const [lensColor, setLensColor] = useState(getPart({ componentType: TYP_COP_PRODUCT_1, partType: 'LENS_COLOR'}) || '6');
  const [initialized, setInitialized] = useState(false);
  const LENS_SHAPE_ROUND = getText('ui-signalization-lens-round');
  const LENS_SHAPE_SQUARE = getText('ui-signalization-lens-square');
  const LENS_COLOR_BLACK = getText('ui-signalization-lens-color-black');
  const LENS_COLOR_MIRROR = getText('ui-signalization-lens-color-mirror');

  const selectedCopId = useMemo(() => getComponent({ type: TYP_COP_PRODUCT_1 }), [design])

  function getDisplayedValue() {
    const lensText = (selectedCopId === 'KCF01P' || selectedCopId === 'KCF02P' || selectedCopId === 'KCF01C' || selectedCopId === 'KCF02C' || selectedCopId === 'KCS01' || selectedCopId === 'KCS02' ) ? ((lensShape === 'square' ? 'ui-signalization-lens-square' : 'ui-signalization-lens-round')): '';
    const colorText =( selectedCopId === 'KCF02P' || selectedCopId === 'KCF02C' || selectedCopId === 'KCF12C' || selectedCopId === 'KCS02') ? ( (lensColor === '6'? 'ui-signalization-lens-color-black' : 'ui-signalization-lens-color-mirror')): '';
    const comma = (lensText !== '' && colorText !== '') ? ',' : ''
    const displayText = getText(lensText) + comma + getText(colorText);
    return displayText
  }

  useEffect(() => {
    setInitialized(true)
  },[])


  const lensShapes = [{ name: LENS_SHAPE_ROUND, id: 'round' },{ name: LENS_SHAPE_SQUARE, id: 'square' }]
  const lensColors = [{ name: LENS_COLOR_BLACK, id: '6'}, {name: LENS_COLOR_MIRROR, id: '7'}]
  

  const lensShapeHandler = (id) => {
    setPart({ componentType: TYP_COP_PRODUCT_1, partType: 'LENS', component: id });
    setLensShape(id)
  };

  const lensColorHandler = (id) => {
    setPart({ componentType: TYP_COP_PRODUCT_1, partType: 'LENS_COLOR', component: id });
    setLensColor(id)
  }

  return (
    <div data-testid='EditLensSections' className={`EditLensSections ${className}`}>
      
      <SectionAccordion heading={getText('ui-signalization-lens-section-heading')} displayedValue={getDisplayedValue()}>
      {(selectedCopId === 'KCF01P' || selectedCopId === 'KCF02P' || selectedCopId === 'KCF01C' || selectedCopId === 'KCF02C' || selectedCopId === 'KCS01' || selectedCopId === 'KCS02' )  &&
      <>
        <HeadingComponent heading={getText('ui-signalization-lens-component-heading')} />
        <RadioButtonGroup
              selectionList={lensShapes}
              theme='white'
              selectedItem={{ id: lensShape }}
              labelField='name'
              onChange={(id) => lensShapeHandler(id)}
            />
      </>
      }
      {(selectedCopId === 'KCF02P' || selectedCopId === 'KCF02C' || selectedCopId === 'KCF12C' || selectedCopId === 'KCS02')  &&
      <>
        <HeadingComponent heading={getText('ui-signalization-lens-color-component-heading')} />
        <RadioButtonGroup
              selectionList={lensColors}
              theme='white'
              selectedItem={{ id: lensColor }}
              labelField='name'
              onChange={(id) => lensColorHandler(id)}
            />
        </>
      }
      </SectionAccordion>
    </div>
  );
}

export default EditLensSections;
