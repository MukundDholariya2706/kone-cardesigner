import './Slider.scss';
import ReactSlider from 'react-slider';
import React from 'react';
import Icon from '../Icon'

const Slider = ({ className, icon, value = 0, onChange, min = 0, max = 1, step = 1, pre, post }) => {
  return (
    <div className={'Slider' + (icon ? ' with-icon' : '') + (className ? ` ${className}` : '') + (pre ? ' with-pre' : '') + (post ? ' with-post' : '')}>
      { icon && <Icon id={icon}/> }
      { pre && <div className="Slider-pre">{pre}</div>}
      <ReactSlider
        value={value}
        min={min}
        max={max}
        step={step}
        className="horizontal-slider"
        thumbClassName="horizontal-slider-thumb"
        trackClassName="horizontal-slider-track"
        onChange={val => { onChange && onChange(val) }}
      /> 
      { post && <div className="Slider-post">{post}</div> }
    </div>
  )
}

export default Slider; 

