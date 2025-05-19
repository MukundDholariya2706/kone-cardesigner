import "./Layout.scss"

import React, { useContext, useState } from 'react';
import { Helmet } from "react-helmet"
import { TranslationContext } from '../../store/translation';

import Header from "../Header"
import NavBar from "../NavBar"

import CookieConsent from "react-cookie-consent";
import { useWindowSize } from '../../utils/customHooks';
import { SiteContext } from '../../store/site/SiteProvider';
import { DataContext } from "../../store/data";
import OpenSurveyBanner from '../OpenSurveyBanner/OpenSurveyBanner';
import { FeedbackDialog } from '../FeedbackForms/FeedbackForms';
import GiveFeedbackButton from '../GiveFeedbackButton/GiveFeedbackButton';

/**
 * Creates the main layout of the application
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const Layout = ({ 
  children, 
  limitedWidth=false, 
  fixedHeight=false,
  showHeader=true, 
  stickyHeader=true,
  showHeaderContactLink,
  showHeaderLogin,
  showNavBarLogin,
  hideLinkOnMobile,
  panel: Panel,
  panelProps = {},
  nav: Nav,
  showNavBar=true,
  navBarTitle, 
  navBarLinkTo, 
  navBarLinkLabel, 
  navBarLinkLabelSmall,
  navBarChildren, 
  navBarClassName,
  navBarCenterChildren,
  bottomNavChildren,
  paddingBottom,
  onNavBarLinkClick,
  stickyNavBar=true,
  headerBorder,
  onMainClick,
  blur,
  navBarToUse,
  showSurveyBanner,
  feedbackButtonEditorMode,
  className,
  showGiveFeedbackButton,
}) => {
  
  const { height } = useWindowSize();
  const { getText, hasText } = useContext(TranslationContext);
  const { getBackLink } = useContext(SiteContext);
  const { domainCountry } = useContext(DataContext);
  const [ showFeedbackDialog, setShowFeedbackDialog ] = useState(false)
  
  const style = {}

  if (fixedHeight) {
    style.height = height + 'px';
  } else {
    style.minHeight = height + 'px' 
  }

  if (paddingBottom) {
    style.paddingBottom = paddingBottom
  }

  function handleSurveyBannerButtonClick() {
    setShowFeedbackDialog(true)
  }

  return (
    <div className={'Layout' + (className ? ` ${className}` : '') + (limitedWidth ? ' maxWidth' : '') + ((showHeader && stickyHeader) ? ' sticky-header' : '') + ((showNavBar && stickyNavBar) ? ' sticky-navbar' : '') + (blur ? ' blur' : '') + (bottomNavChildren ? ' with-bottom-nav' : '') } style={style} >
      {
      showSurveyBanner && 
      <OpenSurveyBanner onButtonClick={handleSurveyBannerButtonClick} />}
      { hasText('ui-landing-kone-car-designer') && <Helmet title={ getText('ui-landing-kone-car-designer')} /> }
      { Nav && <Nav /> }
      { Panel && <Panel {...panelProps} /> }
      <main onClick={ onMainClick }>
        { showHeader && <Header showContactLink={showHeaderContactLink} showLogin={showHeaderLogin} sticky={stickyHeader} border={headerBorder} /> }
        { showNavBar &&
          (navBarToUse ? navBarToUse :
          <NavBar 
            className={navBarClassName} 
            title={navBarTitle} 
            linkTo={navBarLinkTo || getBackLink()} 
            linkLabel={navBarLinkLabel}
            linkLabelSmall={navBarLinkLabelSmall}
            onLinkClick={onNavBarLinkClick}
            centerChildren={navBarCenterChildren}
            showLogin={showNavBarLogin}
            hideLinkOnMobile={hideLinkOnMobile}
            sticky={stickyNavBar}
            >
            {navBarChildren}
          </NavBar>)
        }
        { children }
      { domainCountry?.showCookieConsentBanner &&
        <CookieConsent 
          disableStyles={true}
          contentClasses="container"
          buttonText={getText('ui-general-i-accept')}
        >
          <p>{getText('ui-general-cookie-policy')}</p>
        </CookieConsent>
      }
      { bottomNavChildren && 
        <div className="bottom-navigation">
          {bottomNavChildren}
        </div>
      }
      {
        showGiveFeedbackButton &&
        <div className={`feedback-button-container ${feedbackButtonEditorMode ? 'editor-mode' : ''}`}>
          <GiveFeedbackButton stickRight={feedbackButtonEditorMode} />
        </div>
      }
      {
        showFeedbackDialog &&
        <FeedbackDialog
          onClose={() => setShowFeedbackDialog(false)}
        />
      }
      </main>
    </div>
  )
}
export default Layout