import React from 'react';
import { Link } from "react-router-dom";

import './NavBar.scss';
import Icon from '../Icon';
import LoginComponent from '../LoginComponent';
import TranslationModeToggler from '../TranslationModeToggler/TranslationModeToggler';

/**
 * Renders out the top navigation bar in the 3D viewer
 * @function NavBar NavBar renderer
 * @param {Object} props Properties passed to this renderer
 */
const NavBar = ({ children, title, linkTo, linkLabel, linkLabelSmall, hideLinkOnMobile, onLinkClick, className, centerChildren, sticky, showLogin }) => {  

  return (
    <div className={ 'NavBar' + (className ? ' ' + className : '') + (sticky ? ' sticky' : '') }>  
      <div className="left">
        { linkTo && 
          (
            <Link onClick={onLinkClick} to={linkTo} className={`back-link ${hideLinkOnMobile ? 'hide-on-mobile' : ''}`}>
              <Icon style={{fill: '#0071b9'}} id="icon-chevron-down" />
              <span>{linkLabel}</span>
              <span className="small-label" >{linkLabelSmall || linkLabel}</span>
            </Link>
          )
        } 
      </div>
      <div className="center">
        { title && <div className="title">{title}</div>}
        { centerChildren }
      </div>
      <div className="right">
        { children }
        <TranslationModeToggler />
        {
          showLogin &&
          <LoginComponent cardFromTop="2.6rem" />
        }
      </div>
       
    </div>
  )
}

export default NavBar;
