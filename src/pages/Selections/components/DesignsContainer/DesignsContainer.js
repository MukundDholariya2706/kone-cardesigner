import React, { useMemo, useContext } from 'react'
import { Link } from 'react-router-dom'
import Sprite from '../../../../components/Sprite'
import { EXTRA_FEATURES } from '../../../../constants'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import PredesignTheme from '../PredesignTheme/PredesignTheme'

import './DesignsContainer.scss'


/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function DesignsContainer(props, ref) {
  const {
    className = '',
    designs, themes,
    baseUrl,
    productId,
    extraFeatures
  } = props

  const { getText } = useContext(TranslationContext)

  const [mainThemes, localThemes] = useMemo(() => {
    const main = []
    const local = []
    themes.forEach(theme => {
      const formatted = {
        id: theme.id,
        name: theme.name,
        sublabel: theme.sublabel,
        subtitle: theme.subtitle,
        desc: theme.description,
        image: theme.image && theme.image.urlWide,
        video: theme.video && theme.video.url,
        className: theme.class,
        designs: designs.filter(design => design.theme === theme.id),
        bgColor: theme.bgColor
      }

      if (formatted.designs.length > 0) {
        if (theme.custom) {
          local.push(formatted)
        } else {
          main.push(formatted)
        }
      }
    })

    return [main, local]
  }, [themes, designs])

  return (
    <div data-testid="DesignsContainer" ref={ref} className={`DesignsContainer ${className}`}>
      <div className="DesignsContainer__content">
        { (!extraFeatures || extraFeatures.indexOf(EXTRA_FEATURES.NO_BLANK) === -1) &&
          <BlankDesign to={`${baseUrl}/blank`} />
        }
        { mainThemes.length > 0 && 
          <h3 className="DesignsContainer__sub-header view-header">{getText('ui-selector-choose-template')}</h3>
        }
        {
          mainThemes.map((theme, i) => {
            return (
              <PredesignTheme themeInfoWidth={4} key={theme.id} theme={theme} baseUrl={baseUrl} className={theme.className} />
            )
          })
        }
        { localThemes.length > 0 && 
          <h3 className="DesignsContainer__sub-header view-header">{getText('ui-selector-local-recommendations')}</h3>
        }
        {
          localThemes.map(theme => {

            return (
              <PredesignTheme
                key={theme.id}
                className="local-designs"
                theme={theme}
                baseUrl={baseUrl}
                themeInfoWidth={2}
              />
            )
          })
        }
      </div>
    </div>
  )
}

function BlankDesign(props) {
  const { to, className = '' } = props

  const { getText } = useContext(TranslationContext)

  return (
    <div 
      className={`BlankDesign PredesignTheme ${className}`}
      style={{ 
        background: `url(thumbnails/predesign-themes/blank-1134x385.png)`
      }}
      >
      <div
        className={`PredesignTheme__heading width-3`}
      >
        <div className="PredesignTheme__info-container">
          <h3 className="PredesignTheme__header">{getText('ui-selector-project-empty')}</h3>
          <p className="PredesignTheme__description">
            {getText('ui-selector-blank-car-description')}
          </p>
          <Link to={to} className="PredesignTheme__action-button">{getText('ui-general-open')}</Link>
        </div>
        
      </div>
      <Link
        to={to}
        className={`Predesign ${className}`}
      >
        <div className="Predesign__sprite-container">
          <Sprite src={'thumbnails/blank-deep.png'} className={`shape-DEEP`} />
        </div>
      </Link>
    </div>
  )
}

export default React.forwardRef(DesignsContainer)