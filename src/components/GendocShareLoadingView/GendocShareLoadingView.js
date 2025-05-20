import React, { useContext } from 'react'
import Loader from '../Loader'

import { TranslationContext } from '../../store/translation/TranslationProvider';
import reviewDesignImage from '../../assets/images/react.svg'
import updateDesignImage from '../../assets/images/react.svg'
import contactAboutDesignImage from '../../assets/images/react.svg'
import Sprite from '../../components/Sprite';

import './GendocShareLoadingView.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function GendocShareLoadingView(props) {
  const {
    progress = 0,
    isEditable,
    className = ''
  } = props

  const { getText } = useContext(TranslationContext)

  return (
    <div data-testid="GendocShareLoadingView" className={`GendocShareLoadingView ${className}`}>
      <div className="header-container">
        <h1 className="header">{getText('ui-info-dialog-main-heading')}</h1>
      </div>
      <div className="info-container">
        <InfoItem
          imageSrc={reviewDesignImage}
          title={getText('ui-info-dialog-heading-review')}
          text={getText('ui-gendoc-loader-desc-review')} />
        {
          isEditable &&
          <InfoItem
            imageSrc={updateDesignImage}
            title={getText('ui-info-dialog-heading-update')}
            text={getText('ui-gendoc-loader-desc-update')} />
        }
        <InfoItem
          imageSrc={contactAboutDesignImage}
          title={getText('ui-info-dialog-heading-contact')}
          text={getText('ui-gendoc-loader-desc-contact')} />
      </div>
      <Loader progress={progress} />
    </div>
  )
}

function InfoItem(props) {
  const {
    imageSrc,
    title,
    text,
    className = '',
  } = props

  return (
    <div className={`InfoItem ${className}`}>
      <div className="image-container">
        <Sprite src={imageSrc} />
      </div>
      <div className="content-container">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default GendocShareLoadingView