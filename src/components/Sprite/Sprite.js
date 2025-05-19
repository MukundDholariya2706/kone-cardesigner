import './Sprite.scss';
import React from 'react';
const spritesheets = require('../../constants/spritesheets.json');

export function getBGStyle(url) {  
  if (!url) {
    return null
  }

  if (!spritesheets.hasOwnProperty(url)) {
    // if sprite is missing, create fallback
    return {
      backgroundImage: `url(${url})`,
      backgroundSize: 'cover'
    }
  }

  const {
    backgroundImage,
    backgroundSize,
    backgroundPosition,
  } = spritesheets[url]

  return {
    backgroundImage,
    backgroundSize,
    backgroundPosition,
  }
}

const Sprite = ({ src, src2x, className, style, alt='' }) => {
  if (!spritesheets.hasOwnProperty(src)) {
    // if sprite is missing, create fallback img

    let srcSet = `${src} 1x`

    if (src2x) {
      srcSet += `, ${src2x} 2x`
    }

    return (
      <img data-testid={src} src={src} className={'Sprite' + (className ? ` ${className}` : '')} srcSet={srcSet} title={alt} />
    )
  }
  
  const {
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    width, 
    height,
  } = spritesheets[src]

  style = {
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    paddingTop: (100 * height / width) + '%',
    ...style
  }
  return (
    <div className={'Sprite' + (className ? ` ${className}` : '')} style={ style } title={alt}></div>
  )
}

export default Sprite; 

