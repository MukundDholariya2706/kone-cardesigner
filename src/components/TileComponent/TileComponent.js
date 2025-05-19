import "./TileComponent.scss"

import React from 'react';
import Icon from '../Icon';
import TileImage from "../TileImage/TileImage";

/**
 * Creates the tile component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const TileComponent = ({ 
  title,
  subtitle,
  showSapId=true,
  image,
  alt = '',
  images,
  imageClassName,
  icon,
  bordered,
  iconTitle,
  selected = false,
  direction = "column",
  onClick,
  children,
}) => {

  return (
    <div 
      className={ 'TileComponent' + ( direction ? ` direction-${direction}` : '' ) + ( selected ? ' selected' : '' ) + ( bordered ? ' bordered' : '' ) } 
      onClick={ onClick && onClick.bind(this) } 
    >
      <TileImage className="TileComponent-thumbnail" image={image} images={images} imageClassName={imageClassName} alt={alt}>
        <div className="select-rect" title={alt}/>
        { icon &&
          <div className="tile-icon" title={iconTitle}>
            <Icon id={icon} />
          </div>
        }
      </TileImage>
        <div className="TileComponent-label">
          {showSapId &&
            (
              <>
                {title}
              </>
            )
          }
          {subtitle &&
            <div className="subLabel" >
              {subtitle}
            </div>
          }
        </div>
        
       { children }
    </div>
  )
}
export default TileComponent