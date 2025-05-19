import "./GridComponent.scss"

import React from 'react';

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const GridComponent = ({ 
  children, 
  gap,
  className = '',
  cols = 3,
  tabletCols,
  style = {},
  padding,
  preKey=''
}) => {

  return (
    <div className={`Grid ${className} cols-` + cols + (gap ? ' gap-' + gap : '') + (padding ? ' padding-' + padding : '') + ( tabletCols ? ` tablet-cols-${tabletCols}` : '' )} style={style}>
       { React.Children.toArray(children).map((item, key) => {
        return (
          <div key={preKey+key} className="GridItem">
            { item }
          </div>
        )
      }) }       
    </div>
  )
}

export default GridComponent