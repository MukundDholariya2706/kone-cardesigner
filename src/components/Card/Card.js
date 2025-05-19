import React from 'react';
import './Card.scss';

/**
 * Renders out the Card 
 * @function Card Card renderer
 * @param {Object} params Properties passed to this renderer
 */
const Card = ({children, header, className }) => {

  return (
    <div className={'Card' + (className !== undefined ? ' ' + className : '') }>
      <div className="card-header">
        <h2>{header}</h2>
      </div>
      <div className="card-body">        
        {children}
      </div>      
    </div>
  )
}

export default Card;
