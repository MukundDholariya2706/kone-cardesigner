import React from "react"

import "./EditorLayout.scss"
import Icon from "../Icon";

/**
 * Creates the main layout of the application
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const Layout = ({ children, className, heading, desc='', descLabel, action='', actionClickHandler, readMore='', readMoreClickHandler }) => (
  <div className={'EditorLayout' + (className ? ` ${className}` : '')}>
    <div className="editorHeading">
      <div className="mainTitleContainer">
        <h2 className={action!=='' ?'actionPadding': (desc!==''? 'descPadding': '')}>{heading}</h2>
        { readMore !== '' &&
          <div className="actionLink">
            <div className="actionClickContainer" onClick={readMoreClickHandler}>
              <div className="actionLabel">
                {readMore}
              </div>
            </div>
          </div>
        }
      </div>
      { desc!=='' &&
        <div className="descHeader">
          <div className="descLabel">
            {descLabel}
          </div>
          <div className="descText">
            {desc}
          </div>
        </div>
      }
      { action!=='' &&
        <div className="actionLink">
          <div className="actionClickContainer" onClick={actionClickHandler}>
            <Icon style={{fill: '#0071b9'}} id="icon-chevron-down" />
            <div className="actionLabel">
              {action}
            </div>
          </div>
        </div>
      }
    </div>
    {children}
  </div>
)
export default Layout