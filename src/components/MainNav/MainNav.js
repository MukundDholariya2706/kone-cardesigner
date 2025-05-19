import React, { useContext} from 'react';
import { LayoutContext } from '../../store/layout';
import Bowser from "bowser";
import Icon from "../Icon"

import { EDIT_VIEW_ACCESORIES, EDIT_VIEW_SKIRTING, EDIT_VIEW_HANDRAIL, EDIT_VIEW_MODEL, EDIT_VIEW_CEILING, EDIT_VIEW_WALLS, EDIT_VIEW_FLOOR,
        EDIT_VIEW_DOORS, EDIT_VIEW_SIGNALIZATION, VIEW3D_MODE_CAR, EDIT_VIEW_MIRRORS, EDIT_VIEW_BUFFER_RAIL, EDIT_VIEW_TENANT_DIRECTORY,
        EDIT_VIEW_INFO_MEDIA_SCREENS, EDIT_VIEW_SEAT, TYP_COP_PRODUCT_1, COMPONENT_COP_NONE, EDIT_VIEW_CUSTOM_FLOOR_FINISH, EDIT_VIEW_CUSTOM_WALL_FINISH,
        EDIT_VIEW_DIGITAL_SERVICES, EDIT_VIEW_CONNECTED_SERVICES, EDIT_VIEW_ELEVATOR_MUSIC, EDIT_VIEW_ELEVATOR_CALL, EDIT_VIEW_ROBOT_API, EDIT_VIEW_AIR_PURIFIER, KCSM_24_7_CONNECT, KCSM_ELEV_MUSIC, KCSM_MOBILE_ELEV_CALL, KCSM_APF_SERV_ROBOT_API} from '../../constants'

import './MainNav.scss';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import { UserContext } from '../../store/user';
import { ProductContext } from '../../store/product';

import { setAnalyticsForEvent} from '../../utils/analytics-utils'

/**
 * Renders out the main navigation
 * - uses LayoutConsumer as store
 * @function MainNav MainNav renderer
 * @param {Object} props Properties passed to this renderer
 */
const MainNav = (props) => {
  
  const layout = useContext(LayoutContext);
  const { getComponent } = useContext(DesignContext);
  const { getText } = useContext(TranslationContext);
  const { language } = useContext(UserContext)
  const { product } = useContext(ProductContext)

  const accessoriesViews = [EDIT_VIEW_ACCESORIES, EDIT_VIEW_SKIRTING, EDIT_VIEW_HANDRAIL, EDIT_VIEW_MIRRORS, EDIT_VIEW_BUFFER_RAIL, EDIT_VIEW_TENANT_DIRECTORY,
    EDIT_VIEW_INFO_MEDIA_SCREENS, EDIT_VIEW_SEAT, EDIT_VIEW_AIR_PURIFIER];

  const digitalServicesViews = [EDIT_VIEW_DIGITAL_SERVICES, EDIT_VIEW_CONNECTED_SERVICES, EDIT_VIEW_ELEVATOR_MUSIC, EDIT_VIEW_ELEVATOR_CALL, EDIT_VIEW_ROBOT_API];

  const browser = Bowser.getParser(window.navigator.userAgent).getBrowserName()

  const mainNaviClickHandler = (panel) => {
    if(panel === layout.editView || !layout.editPanelOpen) {
      layout.setEditPanelOpen(!layout.editPanelOpen);
    }
    layout.setEditView(panel);
    layout.setWasEditing(panel);

    setAnalyticsForEvent({ 
      eventName: 'Nav Click',
      eventData:{
        name: panel
      }
    })

    if (panel === EDIT_VIEW_DOORS) { 
      // nothing yet
    } else if(panel === EDIT_VIEW_SIGNALIZATION) {
      const cop = getComponent({ type: TYP_COP_PRODUCT_1 });
      if (!cop || cop === COMPONENT_COP_NONE) {
        layout.setView3dMode(VIEW3D_MODE_CAR);  
      }
    } else {
      layout.setView3dMode(VIEW3D_MODE_CAR);
    }
  };

  const showDigitalServices = product?.componentsData?.kcsmServices?.some(service => ([KCSM_24_7_CONNECT, KCSM_ELEV_MUSIC, KCSM_MOBILE_ELEV_CALL, KCSM_APF_SERV_ROBOT_API].includes(service.id) && !service.disabled ) )

  return (
    <div className="MainNav">

      <div className={'buttons'+ (browser.indexOf('Safari')!==-1?' safari':'')}>
        <div className={'button' + (layout.editView === EDIT_VIEW_MODEL ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_MODEL)}>
          <div className="icon"><Icon id="icon-model-and-layout" /></div>
          <div className="iconLabel" lang={language.code || 'en-EN'}>
            {getText('ui-nav-layout')}
          </div>
        </div>

        <div className={'button' + (layout.editView === EDIT_VIEW_CEILING ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_CEILING)}>
          <div className="icon">
            { layout.editView === EDIT_VIEW_CEILING ?
            <Icon id="icon-ceiling-selected" /> :
            <Icon id="icon-ceiling" />
            }
          </div>
          <div className="iconLabel" lang={language.code || 'en-EN'}>
            {getText('ui-nav-ceiling')}
          </div>
        </div>

        <div className={'button' + ((layout.editView === EDIT_VIEW_WALLS || layout.editView === EDIT_VIEW_CUSTOM_WALL_FINISH) ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_WALLS)}>
        <div className="icon">
            { layout.editView === EDIT_VIEW_WALLS ?
            <Icon id="icon-walls-selected" /> :
            <Icon id="icon-walls" />
            }
          </div>
          <div className="iconLabel" lang={language.code || 'en-EN'}>
            {getText('ui-nav-walls')}
          </div>
        </div>

        <div className={'button' + ((layout.editView === EDIT_VIEW_FLOOR || layout.editView === EDIT_VIEW_CUSTOM_FLOOR_FINISH) ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_FLOOR)}>
        <div className="icon">
            { layout.editView === EDIT_VIEW_FLOOR ?
            <Icon id="icon-floor-selected" /> :
            <Icon id="icon-floor" />
            }
          </div>
          <div className="iconLabel" lang={language.code || 'en-EN'}>
            {getText('ui-nav-floor')}
          </div>
        </div>

        <div className={'button' + (layout.editView === EDIT_VIEW_DOORS ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_DOORS)}>
        <div className="icon">
            { layout.editView === EDIT_VIEW_DOORS ?
            <Icon id="icon-doors-selected" /> :
            <Icon id="icon-doors" />
            }
          </div>
          <div className="iconLabel" lang={language.code || 'en-EN'}>
            {getText('ui-nav-door')}
          </div>
        </div>
        
        <div className={'button' + (layout.editView === EDIT_VIEW_SIGNALIZATION ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_SIGNALIZATION)}>
        <div className="icon">
            { layout.editView === EDIT_VIEW_SIGNALIZATION ?
            <Icon id="icon-signalization-selected" /> :
            <Icon id="icon-signalization" />
            }
          </div>
          <div className="iconLabel" lang={language.code || 'en-EN'}>
            {getText('ui-nav-ui')}
          </div>
        </div>
        
        <div className={'button' + ( (accessoriesViews || []).indexOf(layout.editView) !== -1 ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_ACCESORIES)}>
        <div className="icon">
            { layout.editView === EDIT_VIEW_ACCESORIES ?
            <Icon id="icon-accessories-selected" /> :
            <Icon id="icon-accessories" />
            }
          </div>
          <div className="iconLabel" lang={language.code || 'en-EN'}>
            {getText('ui-nav-accessories')}
          </div>
        </div>

        { showDigitalServices && 
          <div className={'button' + ( (digitalServicesViews || []).indexOf(layout.editView) !== -1 ? ' selected' : '')} onClick={ e => mainNaviClickHandler(EDIT_VIEW_DIGITAL_SERVICES)}>
          <div className="icon">
              { layout.editView === EDIT_VIEW_DIGITAL_SERVICES ?
              <Icon id="icon-digital-services-selected" /> :
              <Icon id="icon-digital-services" />
              }
            </div>
            <div className="iconLabel" lang={language.code || 'en-EN'}>
              {getText('ui-nav-digital-services')}
            </div>
          </div>
        }

      </div>

    </div>
  )
}

export default MainNav;