import "./ImageWithCaption.scss"
import React  from 'react';
import Sprite from '../Sprite';

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const ImageWithCaption = ({
  title,
  image,
  description,
  showDescription=false,
  onClick,
  selected=false,
  selectedStyle='selected',
  style='',
  children, 
}) => {

  return (
    <div className="ImageWithCaption" style={style ? style: {}}> 
      <div className={'thumbnailItem' + (selected ?' '+selectedStyle :'') } onClick={onClick.bind(this)}>
          <Sprite className="thumbnailImg" src={image} />
          <div className="thumbnailCaption">
            <div className="thumbnailLabel">
                { title }
            </div>
            { showDescription && (
                <div className="thumbnailDescription">
                    { description }
                </div>
            ) }
          </div>
      </div>
      { children }
    </div>
  )
}
export default ImageWithCaption