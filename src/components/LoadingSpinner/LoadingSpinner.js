import './LoadingSpinner.scss';
import React from 'react';
import animation from '../../assets/images/loading_blue_128x.gif'

const LoadingSpinner = (props) => {

  return (      
    <div className="LoadingSpinner">
      <img src={animation} alt="loading..." />
    </div>
  )
}
export default LoadingSpinner;