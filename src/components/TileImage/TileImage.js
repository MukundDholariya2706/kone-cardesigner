import "./TileImage.scss"

import React from 'react';
import Sprite from '../Sprite';

/**
 * Renders TileImage
 * @param {Object} props Properties passed to this renderer
 */
const TileImage = ({ 
  id=null,
  alt='',
  image,
  images,
  imageClassName,
  fallbackImage,
  className,
  children,
}) => {  
  return (
    <div className={'TileImage' + (className ? ` ${className}` : '')} id={id ?id :''}>
      { image && <Sprite src={image} alt={alt} />}
      { images && images.map((src, index) => {
        if (!src) {
          return null
        }
        return <Sprite className={imageClassName} key={index} src={src} alt="" />
      })}
      { fallbackImage && !image && !images && <Sprite src={fallbackImage} alt="" />}
      { children }
    </div>
  )
}
export default TileImage