import React, { useMemo, useContext, useState } from 'react'
import { ProductContext } from '../../store/product/ProductProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import Icon from '../Icon'
import Info from '../info'
import TileImage from '../TileImage'
import emptyWallIcon from '../../assets/icons/wall-finish.png'


import './DesignInfo.scss'
import { capitalizeString } from '../../utils/generalUtils'
import { KCSM_24_7_CONNECT, KCSM_AIR_PURIFIER, KCSM_APF_SERV_ROBOT_API, KCSM_ELEV_MUSIC, KCSM_KONE_INFORMATION, KCSM_MOBILE_ELEV_CALL, SEPARATE_HALL_INDICATORS } from '../../constants'
import { useDesignInformation } from '../../utils/customHooks/customHooks'

import img247Services from "../../assets/images/connected-services.png";
import imgKoneInformation from "../../assets/images/kone-information.png";
import imgElevatorMusic from "../../assets/images/elevator-music.png";
import imgElevatorCall from "../../assets/images/elevator-call.png";
import imgRobotApi from "../../assets/images/robot-api.png";
import { createServiceReadMoreUrlGetter } from '../../utils/product-utils'


/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function DesignInfo(props) {
  const {
    className = '',
  } = props

  const { getText } = useContext(TranslationContext)
  const productStore = useContext(ProductContext)

  const loadDesignInformation = useDesignInformation()

  const getReadMoreUrl = createServiceReadMoreUrlGetter(productStore.product)

  // Assume the design always stays in the same state as when this component is rendered. (useState instead of just normal variable so as to only run the loadDesignInformation function on the initial render)
  const [ design ] = useState(() => {
    if (props.design) return props.design
    return loadDesignInformation()
  })


  const showDecoGlassCombinations = useMemo(() => {
    return productStore.product?.wallEditor?.decorativeMirrors
  }, [productStore.product])

  function arrToStr(arrOfKeys) {
    if(arrOfKeys.length < 1) {
      return ''
    }
    const translatedStrings = arrOfKeys.filter(item => item !== null).map(item => getText(item))
    return translatedStrings.join(', ')
  }

  const premiumIcon = productStore?.product?.businessSpecification?.market === 'ENA' ?'icon-premium-ena' :'icon-premium'
  const premiumIconInverse = productStore?.product?.businessSpecification?.market === 'ENA' ?'icon-premium-ena-inverse' :'icon-premium-inverse'

  const renderWallFinishes = (wall, offering, showCenterPanel = true) => {
    const hasWallFinish = (wall && wall.finishes && wall.finishes.length > 0)
    const hasMixedFinishes = (hasWallFinish && wall.finishes.length === 3)
    const showSapId = offering !== 'ENA'

    if (!hasWallFinish) {
      return <p className="finish-label">{ getText('ui-general-no-selection') }</p>
    }
    if (hasMixedFinishes) {      
      return <p className="finish-label">
        {showSapId                
          ? <>
              {getText('ui-general-left-abbrev')}: { getText(wall.finishes[0]) }, {getText(wall.materials[0])} ({ wall.sapIds[0] !== void(0) ?wall.sapIds[0] :getText('pdf-custom-material') })<br />
              {
                // Not displaying the center panel finish for SOC 1100 width cars, as in these cases three panels in the design actually means two identical panels for the user and in the UI
                showCenterPanel &&
                <>
                  {getText('ui-general-center-abbrev')}: { getText(wall.finishes[1]) }, {getText(wall.materials[1])} ({ wall.sapIds[1] !== void(0) ?wall.sapIds[1] :getText('pdf-custom-material') })<br />
                </>
              }
              {getText('ui-general-right-abbrev')}: { getText(wall.finishes[2]) }, {getText(wall.materials[2])} ({ wall.sapIds[2] !== void(0) ?wall.sapIds[2] :getText('pdf-custom-material') })
            </>
          : <>
              {getText('ui-general-left-abbrev')}: { getText(wall.finishes[0]) }, {getText(wall.materials[0])}<br />
              {
                // Not displaying the center panel finish for SOC 1100 width cars, as in these cases three panels in the design actually means two identical panels for the user and in the UI
                showCenterPanel &&
                <>
                  {getText('ui-general-center-abbrev')}: { getText(wall.finishes[1]) }, {getText(wall.materials[1])}<br />
                </>
              }
              {getText('ui-general-right-abbrev')}: { getText(wall.finishes[2]) }, {getText(wall.materials[2])}
            </>
        }        
      </p>
    }
    return (
      <>
      {showSapId
        ? <p className="finish-label">{ getText(wall.finishes[0]) }, {getText(wall.materials[0])} ({ wall.sapIds[0] !== void(0) ?wall.sapIds[0] :getText('pdf-custom-material') })</p>
        : <p className="finish-label">{ getText(wall.finishes[0]) }, {getText(wall.materials[0])}</p>
      }
      </>
    )
  }

  function renderFloorFinishes(floor, offering) {
    const hasFinish = (floor && floor.finishes && floor.finishes.length > 0)
    const hasMixedFinishes = (hasFinish && floor.finishes.length > 1)
    const showSapId = offering !== 'ENA'
    if (!hasFinish) {
      return <p className="finish-label">{ getText('ui-general-no-selection') }</p>
    }
    if (hasMixedFinishes) {      
      return <p className="finish-label">
        { floor.finishes[0] !== undefined && (
          <>
            {showSapId
              ?<>{ getText('ui-floor-base-finish') }: { getText(floor.finishes[0]) }, {getText(floor.materials[0]?.name)} ({ floor.sapIds[0] !== void(0) ?floor.sapIds[0] :getText('pdf-custom-material') })</>
              :<>{ getText('ui-floor-base-finish') }: { getText(floor.finishes[0]) }, {getText(floor.materials[0]?.name)}</>
            }            
          </>
        ) }
        { floor.finishes[1] !== undefined && (
          <>
            <br />
            {showSapId
              ?<>{ getText('ui-floor-frame-finish') }: { getText(floor.finishes[1]) }, {getText(floor.materials[1]?.name)} ({ floor.sapIds[1] !== void(0) ?floor.sapIds[1] :getText('pdf-custom-material') })</>
              :<>{ getText('ui-floor-frame-finish') }: { getText(floor.finishes[1]) }, {getText(floor.materials[1]?.name)}</>
            }            
          </>
        ) }
        { floor.finishes[2] !== undefined && (
          <>
            <br />{ getText('ui-floor-list-finish') }: { getText(floor.finishes[2]) }
          </>
        ) }
      </p>
    }
    return (
      <>
      {showSapId
        ?<p className="finish-label">{ getText(floor.finishes[0]) }, {capitalizeString( getText(floor.materials[0]?.name) )} ({ floor.sapIds[0] !== void(0) ?floor.sapIds[0] :getText('pdf-custom-material') })</p>
        :<p className="finish-label">{ getText(floor.finishes[0]) }, {capitalizeString( getText(floor.materials[0]?.name) )}</p>
      }            
      </>
    ) 
  }

  function getFloorTileClassName(floor) {
    if (!floor || !floor.materials || floor.materials.length < 2) {
      return undefined
    }
    if (floor.materials[0]?.id === 'PVC') {
      return 'MIXED-PVC'
    }
    if (['STONE', 'COMPOSITESTONE'].indexOf(floor.materials[0]?.id) !== -1) {
      return 'MIXED-STONE'
    }
    return undefined
  }


  if (!design) return null

  const trueDigitalServices = design.digitalServices.includes(KCSM_AIR_PURIFIER) 
          ?design.digitalServices.slice(0,design.digitalServices.indexOf(KCSM_AIR_PURIFIER)).concat(design.digitalServices.slice(design.digitalServices.indexOf(KCSM_AIR_PURIFIER)+1,design.digitalServices.length))
          :design.digitalServices;
  // console.log((design.handrail.type && design.handrail.positionsStr),'--', (design.handrail.type && !!design.handrail.positionsStr))
  return (
    <div data-testid="DesignInfo" className={`DesignInfo ${className}`}>
      <div className="block">
        <p className="head">{getText('ui-general-car-layout')}</p>
        
        {design?.ktoc &&        
          <div className="item">
            <div className="type">{getText('ui-general-car-rated-load')}</div>
            <div className="value">{design?.ktocInfo?.load}</div>            
          </div>
        }

        <div className="item">
          <div className="type">{getText('ui-general-car-shape')}</div>
          <div className="value">{getText(design.carShape) || getText('ui-general-no-selection')}</div>
        </div>

        {(design?.ktoc && design?.offeringLocation === 'ENA' && design?.ktocInfo?.range)      
          ? <div className="item">
              <div className="type">{getText('ui-general-car-type')}</div>
              <div className="value">{getText(design.carType)} {getText(design.ktocInfo.range)}</div>            
            </div>
          : <div className="item">
              <div className="type">{getText('ui-general-car-type')}</div>
              <div className="value">{getText(design.carType) || getText('ui-general-no-selection')}</div>
            </div>
        }

        {(design.regulationsAvailable) &&
          <div className="item">
            <div className="type">{getText('ui-general-regulation')}</div>
            <div className="value">{arrToStr(design.regulations) || getText('ui-general-no-selection')}</div>
          </div>
        }
      </div>

      <div className="block">
        <p className="head">{getText('ui-general-car-interior-design')}</p>

        {(showDecoGlassCombinations && design.decoPack.label) && <div className="item">
          <div className="type">{getText('ui-walls-select-deco-mirror')}</div>
          <div className="value">{getText(design.decoPack.label) || getText('ui-general-no-selection')}</div>
        </div>}

        {(design.scenic) && <div className="item">
          <div className="type">{getText('ui-walls-scenic-car-type')}</div>
          <div className="value">{getText(design.scenic.label) || getText('ui-general-no-selection')}</div>
        </div>}

        <div className="item">
          <div className="type">{getText('ui-general-wall-finishes')}
            {(design.wallA.premium || design.wallB.premium || design.wallC.premium || design.wallD.premium) &&
              <div className="inlineIcon">
                <Info text={'wallsInfo'} html={true}>
                  <div className="tooltipHeader">{getText('ui-wall-symbols-header')}</div>
                  <div className="premium-icon">
                    <Icon id={premiumIconInverse} /><div className="premium-text">{getText('ui-general-extended-lead-time')}</div>
                  </div>
                </Info>
              </div>
            }

          </div>
          <div className="wallFinishes">

            <div className="wallFinish">
              <TileImage image={design.wallA.image} images={design.wallA.images} fallbackImage={emptyWallIcon} imageClassName={design.wallA.mixed ? 'MIXED-WALL' : null} >
                {design.wallA.premium &&
                  <div className="icon-premium">
                    <Icon id={premiumIcon} />
                  </div>
                }
              </TileImage>
              <div className="wallFinishTexts">
                <p className="position">{getText('ui-general-wall-a')}</p>
                {renderWallFinishes(design.wallA, design.offeringLocation)}
              </div>
            </div>

            <div className="wallFinish">
              <TileImage images={design.wallB.images} fallbackImage={emptyWallIcon} imageClassName={design.wallB.mixed ? 'MIXED-WALL' : null} id='bFinish' >
                {design.wallB.premium &&
                  <div className="icon-premium">
                    <Icon id={premiumIcon} />
                  </div>
                }
              </TileImage>
              <div className="wallFinishTexts">
                <p className="position">{getText('ui-general-wall-b')}</p>
                {renderWallFinishes(design.wallB, design.offeringLocation)}
              </div>
            </div>

            <div className="wallFinish">
              <div className="topLine" />
              <TileImage images={design.wallC.images} fallbackImage={emptyWallIcon} imageClassName={design.wallC.mixed ? 'MIXED-WALL' : null} id='cFinish' >
                {design.wallC.premium &&
                  <div className="icon-premium">
                    <Icon id={premiumIcon} />
                  </div>
                }
              </TileImage>
              <div className="wallFinishTexts">
                <p className="position">{getText('ui-general-wall-c')}</p>
                {renderWallFinishes(design.wallC, design.offeringLocation, !design.wallC.panelingException)}
              </div>
            </div>

            <div className="wallFinish">
              <div className="topLine" />
              <TileImage images={design.wallD.images} fallbackImage={emptyWallIcon} imageClassName={design.wallD.mixed ? 'MIXED-WALL' : null} id='dFinish' >
                {design.wallD.premium &&
                  <div className="icon-premium">
                    <Icon id={premiumIcon} />
                  </div>
                }
              </TileImage>
              <div className="wallFinishTexts">
                <p className="position">{getText('ui-general-wall-d')}</p>
                {renderWallFinishes(design.wallD, design.offeringLocation)}
              </div>
            </div>

          </div>
        </div>
        <div className="item">
          <div className="type">{getText('ui-general-ceiling')}</div>
          <div className="value">{getText(design.ceiling.type) || getText('ui-general-no-selection')}, {getText(design.ceiling.finish) || getText('ui-general-no-selection')}{(design.ceiling.lightFinish ? (', ' + getText('ui-ceiling-spot-color') + ': ' + getText(design.ceiling.lightFinish)) : '')}</div>
        </div>

        { design.offeringLocation !== 'ENA' &&
          <div className="item">
            <div className="type">{getText('ui-general-floor')}</div>
            <div className="value">
              <div className="floorFinish">
                <TileImage images={design.floor.images} fallbackImage={emptyWallIcon} imageClassName={getFloorTileClassName(design.floor)} />
                <div className="floorFinishText">
                  {renderFloorFinishes(design.floor, design.offeringLocation)}
                </div>
              </div>
            </div>
          </div>
        }

        { design.offeringLocation === 'ENA' &&
          <div className="item">
            <div className="type">{getText('ui-general-floor')}</div>
            <div className="value">{getText('ui-general-floor-ena-notice')}</div>
          </div>
        }

        <div className="item">
          <div className="type">{getText('ui-general-wall-panel-orientation')}</div>
          <div className="value">{getText(design.panelOrientation) || getText('ui-general-no-selection')}</div>
        </div>

      </div>

      <div className="block">
        <p className="head">{getText('ui-door-solution')}</p>
        <div className="item">
          <div className="type">{getText('ui-general-door-type')}</div>
          <div className="value">{getText(design.door.type) || getText('ui-general-no-selection')}, {getText(design.frame.type) || getText('ui-general-no-selection')}</div>
        </div>

        <div className="item">
          <div className="type">{getText('ui-general-door-finish')}</div>
          <div className="value">{getText(design.door.finish) || getText('ui-general-no-selection')} {(design.door.finish && design.door.sapId && design.offeringLocation !== 'ENA') ? '(' + design.door.sapId + ')' : ''}</div>
        </div>

        <div className="item">
          <div className="type">{getText('ui-door-frame-finish')}</div>
          <div className="value">{getText(design.frame.finish) || getText('ui-general-no-selection')} {(design.frame.finish && design.frame.sapId && design.offeringLocation !== 'ENA') ? '(' + design.frame.sapId + ')' : ''}</div>
        </div>
      </div>

      <div className="block">
        <p className="head">{getText('ui-general-ui')}</p>
        <p className="sub-head sub-head-inside">{getText('ui-general-inside')}</p>
        <div className="item">
          <div className="type">{getText('ui-general-signalization-family')}</div>
          <div className="value">{getText(design.cop.family) || getText('ui-general-no-selection')}, {getText(design.cop.type) || getText('ui-general-no-selection')}</div>
        </div>

        <div className="item">
          <div className="type">{getText('ui-general-finish')}</div>
          <div className="value">{getText(design.cop.finish) || getText('ui-general-no-selection')} {(design.cop.finish && design.offeringLocation !== 'ENA') ? '(' + design.cop.finishSapId + ')' : ''}</div>
        </div>

        {design.cop && design.cop.copDisplay &&
          <div className="item">
            <div className="type">{getText(design.cop.copDisplay[0])}</div>
            <div className="value">{getText(design.cop.copDisplay[1]) + ', ' + getText(design.cop.copDisplay[2])}</div>
          </div>
        }

        { design?.horCop?.type &&
          <div className="item">
            <div className="type">{getText('ui-signalization-horizontal')}</div>
            <div className="value">{getText(design.horCop.type) + (design.horCop.finish ?(', '+getText(design.horCop.finish)) :'')}</div>
          </div>
        }
        <p className="sub-head sub-head-landing">{getText('ui-general-landing')}</p>
        <LandingItem
          design={design}
          type="hi"
          title={getText('ui-general-hall-indicator')}
        />
        <LandingItem
          design={design}
          type="hl"
          title={ SEPARATE_HALL_INDICATORS.includes( design?.cop?.familyId) ?getText('ui-general-hall-lantern') :getText('ui-general-hall-indicator')}
        />
        <LandingItem
          design={design}
          type="lcs"
          title={getText('ui-general-lcs')}
        />
        <LandingItem
          design={design}
          type="fb"
          title={getText('ui-signalization-fb')}
        />

        <LandingItem
          design={design}
          type="dop"
          title={getText('ui-general-dop')}
        />

        <LandingItem
          design={design}
          type="din"
          title={getText('ui-general-din')}
        />

        <LandingItem
          design={design}
          type="eid"
          title={getText('ui-general-eid')}
        />

        {design.lcs && design.lcs.type &&
          <div className="item">
            <div className="type">{getText('ui-signalization-landing-components-positioning')}</div>
            <div className="value">{design.lcs.shared ? getText('ui-lcs-position-shared') : getText('ui-lcs-position-elevator-specific')}</div>
          </div>
        }

        {design.dop && design.dop.type &&
          <div className="item">
            <div className="type">{getText('ui-signalization-landing-components-positioning')}</div>
            <div className="value">{design.dop.shared ? getText('ui-lcs-position-shared') : getText('ui-lcs-position-elevator-specific')}</div>
          </div>
        }


      </div>

      {(design.handrail.type || design.mirror.type || design.seat.type || design.skirting.type || design.bufferRail.type || design.infoScreen.type || design.seat.type || design.tenantDirectory.type) &&
        <div className="block">
          <p className="head">{getText('ui-general-car-accessories')}</p>

          {design.mirror.type && design.mirror.positionsStr && <div className="item">
            <div className="type">{getText('ui-general-mirrors')}</div>
            <div className="value">{getText(design.mirror.type) || getText('ui-general-no-selection')}</div>
          </div>}

          {design.handrail.type && design.handrail.positionsStr && <div className="item">
            <div className="type">{getText('ui-general-handrail')}</div>
            <div className="value">{getText(design.handrail.type)}​, {getText(design.handrail.finish) + (design.offeringLocation !== 'ENA' ? ' (' + design.handrail.sapId + ')' : '')}​, {arrToStr(design.handrail.positionsStr)}​</div>
          </div>}

          {design.skirting.type && <div className="item">
            <div className="type">{getText('ui-general-skirting')}</div>
            <div className="value">{getText(design.skirting.finish) + (design.offeringLocation !== 'ENA' ? ' (' + design.skirting.sapId + ')' : '')}​</div>
          </div>}

          {design.bufferRail.type && design.bufferRail.positionsStr && <div className="item">
            <div className="type">{getText('ui-general-buffer-rail')}</div>
            <div className="value">{getText(design.bufferRail.finish) + (design.offeringLocation !== 'ENA' ? ' (' + design.bufferRail.sapId + ')' : '')}​</div>
          </div>}

          {design.infoScreen.type && <div className="item">
            <div className="type">{getText('ui-general-info-media-screens')}</div>
            <div className="value">{(getText(design.infoScreen.type) || getText(design.infoScreen.finish) || getText('ui-general-no-selection'))}​</div>
          </div>}

          {design.seat.type && <div className="item">
            <div className="type">{getText('ui-general-seat')}</div>
            <div className="value">{getText(design.seat.type) || getText('ui-general-no-selection')}, {(getText(design.seat.finish) || '')}</div>
          </div>}

          {design.tenantDirectory.type && <div className="item">
            <div className="type">{getText('ui-general-tenant-directory')}</div>
            <div className="value">{design.tenantDirectory.model + ', ' + design.tenantDirectory.size + ', ' + getText(design.tenantDirectory.finish)}​</div>
          </div>}

          { (design.digitalServices.indexOf(KCSM_AIR_PURIFIER) !== -1)&& <div className="item">
            <div className="type">{getText('ui-general-air-purifier')}</div>
            <div className="value">{getText('ui-included')}​</div>
          </div>}

        </div>}

        { trueDigitalServices?.length > 0 &&
          <div className="block">
            <p className="head">{getText('ui-digital-services-heading')}</p>

            { (design.digitalServices.indexOf(KCSM_24_7_CONNECT) !== -1) &&
              <div className="item">
                <div className="type"><img src={img247Services} className="serviceImage" /></div>
                <div className="service">
                  <div className="serviceTitle">{getText('ui-24-7-connected-services-complete-term')}</div>
                  <div className="serviceBody">{getText('ui-24-7-connected-services-general-info')}</div>
                  { getReadMoreUrl(KCSM_24_7_CONNECT) && 
                  <div className="serviceLink">
                    <a href={getReadMoreUrl(KCSM_24_7_CONNECT)} target="_blank">
                      {getText('ui-general-read-more')}
                    </a>                  
                  </div>}
                </div>
              </div>
            }

            { (design.digitalServices.indexOf(KCSM_KONE_INFORMATION) !== -1) &&
              <div className="item">
                <div className="type"><img src={imgKoneInformation} className="serviceImage" /></div>
                <div className="service">
                  <div className="serviceTitle">{getText('ui-general-kone-information')}</div>
                  <div className="serviceBody">{getText('ui-general-kone-information-general-info')}</div>
                  { getReadMoreUrl(KCSM_KONE_INFORMATION) &&
                  <div className="serviceLink">
                    <a href={getReadMoreUrl(KCSM_KONE_INFORMATION)} target="_blank">
                      {getText('ui-general-read-more')}
                    </a>                  
                  </div>}
                </div>
              </div>
            }

            { (design.digitalServices.indexOf(KCSM_ELEV_MUSIC) !== -1) &&
              <div className="item">
                <div className="type"><img src={imgElevatorMusic} className="serviceImage" /></div>
                <div className="service">
                  <div className="serviceTitle">{getText('ui-elevator-music-heading')}</div>
                  <div className="serviceBody">{getText('ui-elevator-music-general-info')}</div>
                  { getReadMoreUrl(KCSM_ELEV_MUSIC) &&
                  <div className="serviceLink">
                    <a href={getReadMoreUrl(KCSM_ELEV_MUSIC)} target="_blank">
                      {getText('ui-general-read-more')}
                    </a>                  
                  </div>}
                </div>
              </div>
            }

            { (design.digitalServices.indexOf(KCSM_MOBILE_ELEV_CALL) !== -1) &&
              <div className="item">
                <div className="type"><img src={imgElevatorCall} className="serviceImage" /></div>
                <div className="service">
                  <div className="serviceTitle">{getText('ui-elevator-call-heading')}</div>
                  <div className="serviceBody">{getText('ui-elevator-call-general-info')}</div>
                  { getReadMoreUrl(KCSM_MOBILE_ELEV_CALL) &&
                  <div className="serviceLink">
                    <a href={getReadMoreUrl(KCSM_MOBILE_ELEV_CALL)} target="_blank">
                      {getText('ui-general-read-more')}
                    </a>                  
                  </div>}
                </div>
              </div>
            }

            { (design.digitalServices.indexOf(KCSM_APF_SERV_ROBOT_API) !== -1) &&
              <div className="item">
                <div className="type"><img src={imgRobotApi} className="serviceImage" /></div>
                <div className="service">
                  <div className="serviceTitle">{getText('ui-robot-api-heading')}</div>
                  <div className="serviceBody">{getText('ui-robot-api-general-info')}</div>
                  { getReadMoreUrl(KCSM_APF_SERV_ROBOT_API) &&
                  <div className="serviceLink">
                    <a href={getReadMoreUrl(KCSM_APF_SERV_ROBOT_API)} target="_blank">
                      {getText('ui-general-read-more')}
                    </a>                  
                  </div>}
                </div>
              </div>
            }


          </div>

        }
    </div>
  )
}

function LandingItem(props) {
  const { 
    className = '',
    type: componentType = '',
    title = '',
    design = {},
  } = props

  const { getText } = useContext(TranslationContext)

  if (!design[componentType] || !design[componentType].type) return null

  const { type, finish, finishSapId, offeringLocation } = design[componentType]

  let text = getText(type)

  if (finish) {
    text += `, ${getText(finish)}`
    
    if (offeringLocation !== 'ENA' && finishSapId) {
      text += ` (${finishSapId})`
    }
  } else {
    // Should this be there or not? Previous implementation had it at the end
    // but it would never get displayed because of the invalid logic.
    // text += ` ${getText('ui-general-no-selection')}`
  }

  return (
    <div className={`item ${className}`}>
      <div className="type">{title}</div>
      <div className="value">{text}</div>
    </div>
  )
}

export default DesignInfo