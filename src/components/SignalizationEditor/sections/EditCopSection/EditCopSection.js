import React, { useContext } from 'react'
import jsonLogic from 'json-logic-js';
import SectionAccordion from '../../../SectionAccordion'
import { COPS_WITH_KONE_INFORMATION, KCSM_KONE_INFORMATION, MAT_CAR_FRONT_WALL_A} from '../../../../constants'
import { DesignContext } from '../../../../store/design/DesignProvider'
import { ProductContext } from '../../../../store/product/ProductProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import { LayoutContext } from '../../../../store/layout';
import { FinishList } from '../../../FinishAccordionItem'
import GridComponent from '../../../GridComponent'
import HeadingComponent from '../../../HeadingComponent/HeadingComponent'
import RadioButtonGroup from '../../../RadioButtonGroup'
import TileComponent from '../../../TileComponent'
import InfoBox from '../../../InfoBox';
import KoneInformationDialog from '../../../KoneInformationDialog';

import './EditCopSection.scss'
import { useValidDisplay } from '../../cop-hooks';
import { SignalizationContext } from '../../provider/SignalizationEditorProvider';



/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditCopSection(props) {
  const {
    className = '',
    cops,
    displayTypes = [],
    displayColors = [],
    finishes = [],
    finishType,
    showSapId,
  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)
  const { showDialogKoneInformation, setShowDialogKoneInformation } = useContext(LayoutContext);

  const {
    currentFamily,
    firstCopId, setFirstCop,
    copDisplayType, setCopDisplayType,
    copDisplayColor, setCopDisplayColor
  } = useContext(SignalizationContext)

  const copItem = cops.find(x => x.id === firstCopId)

  const copFinish = getCopFinish()

  const koneInformationAvailable = product?.componentsData?.kcsmServices?.find(service => (service.id === KCSM_KONE_INFORMATION  && !service.disabled))

  function getCopFinish() {
    return designCtx.getFinish({ type: finishType })
  }

  function setCopFinish(id) {
    designCtx.setFinishCOP({ type: finishType, finish: id})
    if(currentFamily === 'KDS660') {
      designCtx.setComponentFinish({type: designCtx.horizontalCopType(), finish: id})
    }
    if(product?.rules?.variousFilteringRules) {
      if(jsonLogic.apply(product.rules.variousFilteringRules, {filteringRULE:'copHasSameFinishAsAWall', SIG_FAMILY:currentFamily, MARKET:product?.businessSpecification?.market, COP:firstCopId} )) {
        designCtx.setFinish({ type: MAT_CAR_FRONT_WALL_A, finish: id })
      }
    }
  }

  useValidDisplay({ 
    item: copItem, 
    selectedType: copDisplayType,
    setType: setCopDisplayType,
    selectedColor: copDisplayColor,
    setColor: setCopDisplayColor
  })

  // Blue section subheader
  function getDisplayedValue() {

    // CHECK can this happen? What then?
    if (!copItem) return ''

    return `${getText(copItem.name)}`
  }

  return (
    <div data-testid="EditCopSection" className={`EditCopSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-cop-options')}
        displayedValue={getDisplayedValue()}
      >
      
        <>
          <HeadingComponent heading={getText('ui-signalization-cop-type')} info={getText('ui-signalization-cop-type-i')} />
          <RadioButtonGroup
            selectionList={cops}
            theme="white"
            selectedItem={{ id: firstCopId }}
            labelField="name"
            onChange={id => setFirstCop(id)} />
          { (COPS_WITH_KONE_INFORMATION.includes(firstCopId) && koneInformationAvailable) && 
            <InfoBox text={getText('ui-layout-kone-information-info')} style={{ marginBottom: '20px', alignItems:'flex-start' }}>
              <p className="read-more" onClick={() => setShowDialogKoneInformation(true)}>
                  { getText('ui-general-read-more')}
              </p>
            </InfoBox>
          }

         </> 

        {displayTypes.length > 1 &&
          <>
            <HeadingComponent heading={getText('ui-cop-display-type')} info={getText('ui-cop-display-type-i')} />
            <RadioButtonGroup
              selectionList={displayTypes}
              selectedItem={{ id: copDisplayType }}
              theme="white"
              labelField="name"
              onChange={id => setCopDisplayType(id)}
            />
          </>
        }
        { displayColors.length > 1 &&
        <>
          <HeadingComponent heading={getText('ui-cop-display-color')} info={getText('ui-cop-display-color-i')} />
          <GridComponent cols="6" gap="xsm" padding="sm" style={{ marginBottom: '0px' }}>
            {displayColors.map((item, index) => (
              <TileComponent
                key={index}
                image={item.image}
                bordered
                selected={item.id === copDisplayColor}
                onClick={id => setCopDisplayColor(item.id)}
              />
            ))}
          </GridComponent>
        </>
        }
        { finishes.length > 0 &&
        <>
          <HeadingComponent heading={getText('ui-signalization-select-finish')} info={getText('ui-signalization-select-finish-i')} />                  
          <FinishList
            finish={copFinish}
            finishes={finishes}
            showCategories={true}
            showSapId={showSapId}
            onChange={id => setCopFinish(id)}
          />
        </>
        }
      </SectionAccordion>
      { ( showDialogKoneInformation && COPS_WITH_KONE_INFORMATION.includes(firstCopId) && koneInformationAvailable ) && 
        <KoneInformationDialog onConfirm={() => setShowDialogKoneInformation(false)} onCancel={() => setShowDialogKoneInformation(false)} screenType="COP" />
      }
    </div>

  )
}

export default EditCopSection