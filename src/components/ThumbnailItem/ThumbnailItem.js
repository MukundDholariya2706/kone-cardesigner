import React from 'react';
import './ThumbnailItem.scss';
import Sprite from '../Sprite';

const ThumbnailItem = ({image, label, className=''}) => {
  return (
    <div className="ThumbnailItem">
      <div className={'image '+className}>
        <Sprite src={image} className={className} />
      </div>
      <div className="caption">
        {label}
      </div>
    </div>
  );
}
export default ThumbnailItem;