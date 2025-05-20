import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Sprite from '../../../../components/Sprite'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'

import './PredesignTheme.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function PredesignTheme(props) {
  const {
    className = '',
    theme,
    themeInfoWidth = 4,
    baseUrl
  } = props

  
  const { getText } = useContext(TranslationContext)

  
  const isIndiaNeb = className.includes('india-neb')

  let themeName

  if (isIndiaNeb) {
    const [prefix, firstHalf, secondHalf] = theme.name.split('-')
    themeName = (
      <div className={`neb-heading ${theme.id}`}>
        <span className="first-half">{firstHalf}</span>
        <span className="second-half">{secondHalf}</span>
      </div>
    )
  } else {
    themeName = getText(theme.name)
  }
  
  return (
    <div data-testid="PredesignTheme" className={`PredesignTheme ${className} theme-${theme.id}`}>
      <div 
        className={`PredesignTheme__heading width-${themeInfoWidth}`} 
        style={{ 
          background: theme.image ? `url(${theme.image})` : theme.bgColor
        }}
      > 
        <div className="PredesignTheme__info-container">
          <h3 className="PredesignTheme__header">{themeName}</h3>
          {theme.subtitle && 
            <p className="PredesignTheme__subtitle">{getText(theme.subtitle)}</p>
          }
          <p className="PredesignTheme__description">{getText(theme.desc)}</p>
        </div>
      </div>
      { theme.designs.map((design, index) => {
        return <Predesign key={design.sapId+'_'+Date.now()+'_'+index} to={`${baseUrl}/${design.sapId}`} design={design} className="PredesignTheme__predesign" />
      })}
    </div>
  )
}

function Predesign(props) {
  const { className = '', design, to } = props
  const { getText } = useContext(TranslationContext)

  return (
    <Link
      to={to}
      className={`Predesign ${className}`}
    >
        <div className={`Predesign__sprite-container shape-${design.carShape}`}>
          <Sprite src={design.image.url} />
        </div>
        <p className="Predesign__name">{getText(design.name)}</p>
    </Link>
  )
}

export default PredesignTheme