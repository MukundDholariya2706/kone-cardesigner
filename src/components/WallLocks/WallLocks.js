import './WallLocks.scss';
import React from 'react';
import Icon from '../Icon';

const WallLocks = ({ className }) => {
  return (
    <div data-testid="wallLocks" className={"WallLocks" + (className ? ` ${className}` : '')}>
      <div className="wall-locks-container">
        <div className="wall-locks-lines" />
        <div className="wall-locks-center-line" />
        <div className="wall-locks-lock">
          <Icon id={'icon-lock'+( ((className || []).indexOf('active') !==-1) ?'-active' :'' )}/>
        </div>
      </div>  
    </div>
  )
}

export default WallLocks; 

