import './PreDesign.scss'
import React, {useContext} from 'react';
import { Link } from "react-router-dom";
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import Sprite, { getBGStyle } from '../Sprite';


const PreDesign = (props) => {

  const {title, buildingsType = '', desc, background, items, video, sublabel, bgColor, className, localDesign, carShape } = props;

  const { getText } = useContext(TranslationContext);
  const { setDesign, setInitDesign } = useContext(DesignContext);

  const onClickHandler = (e, design) => {
    setDesign(design)
    setInitDesign(design)
  }

  const themeTileStyle = {
    ...getBGStyle(background)
  }

  return (
    <div className={"PreDesign" + (className ? ' ' + className : '') }>
      <div className="pre-design-container">

        {/* THEME */}
        <div className="pre-design-tile-container">
          <div className="aspect-ratio-1-1">
            <div className="pre-design-tile theme" 
              style={bgColor ? { backgroundColor: bgColor } : themeTileStyle}>
              <h3>{getText(title)}</h3>
              { sublabel && (<h4>{getText(sublabel)}</h4>) }
              { desc &&
                <div className="description">
                  {getText(desc)}
                </div>
              }              
              { video && (
                <a className="readMore" href={video} target="_blank" rel="noopener noreferrer">
                  {getText('ui-general-watch-video')}
                </a>
              ) }
            </div>
          </div>
        </div>
        
        {/* DESIGN */}
        { items && items.map((item, index) => {
          return (
            <div className="pre-design-tile-container" key={index}>
              <div className="aspect-ratio-1-1">
                <Link key={item.sapId} className="pre-design-tile design-item" to={`edit/${item.sapId}`} onClick={ e => onClickHandler(e, item) }>
                    { item.image && item.image.url && (
                      <div className={`sprite-container ${`shape-${item.carShape}`}${localDesign ? ' local-design-container' : ''}`}>
                        <Sprite src={item.image.url} className={`shape-${item.carShape}`} />
                      </div>
                    ) }
                    <span className="label">{getText(item.name)}</span>
                </Link>
              </div>
            </div>
          )
        })}
        
      </div>
    </div>
)}

export default PreDesign;
