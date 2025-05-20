import './LoadingSpinner.scss';
import React from 'react';
import animation from '../../assets/images/react.svg'

const LoadingSpinner = (props) => {

  return (      
    <div className="LoadingSpinner">
      <img src={animation} alt="loading..." />
    </div>
  )
}
export default LoadingSpinner;