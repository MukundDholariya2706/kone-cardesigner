import React, {useContext} from 'react';
import { Link } from "react-router-dom";
import LanguageSelect from '../LanguageSelect';

import './Header.scss';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Icon from '../Icon';
import LoginComponent from '../LoginComponent';
import { MARINE } from '../../constants';
import { SiteContext } from '../../store/site';

/**
 * Renders out the header part of the view (currently not in use)
 * @function Header Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const Header = ({ showContactLink = true, sticky = false, border = false, showLogin = true }) => {
  
  const { getText } = useContext(TranslationContext);
  const { isMarine: marine } = useContext(SiteContext)

  return(
    <div className={"Header" + (sticky ? ' sticky' : '') + (border ? ' border' : '')}>
      {marine
        ? <h1 className="left"><Link to={`/${MARINE}`} className="backToLanding">{getText('marine-ui-general-car-designer')}</Link></h1>
        : <h1 className="left"><Link to="/" className="backToLanding">{getText('ui-general-car-designer')}</Link></h1>
      }
      
      <div className="logo"><Icon id="kone-logo" /></div>
        <div className="right">
          { showContactLink &&
          <>
            {
              marine ?
              <a 
                href="https://www.kone-marine.com/contact-us/" 
                target="_blank" rel="noopener noreferrer"
                className="contact">
                <span>{getText('ui-general-contact-kone')}</span>
                <Icon id="icon-arrow-blue" />            
              </a> :
              <Link to={'/contact'} className="contact">
                <span>{getText('ui-general-contact-kone')}</span>
                <Icon id="icon-arrow-blue" />            
              </Link>
            }
            </>
          }
          <LanguageSelect></LanguageSelect>
          { showLogin &&
            <LoginComponent cardFromTop="3.2rem" />
          }
      </div>
    </div>
  )
}

export default Header;