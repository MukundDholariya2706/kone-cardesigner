import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { MARINE } from '../../../constants'
import { TranslationContext } from '../../../store/translation'

function HeroMarine(props) {
  const { getText } = useContext(TranslationContext)

  return (
    <section className="hero-marine">
      <div className="bg-container">
        <div className="bg"></div>
      </div>
      <header>
        <h1 className="hero-section-title">{getText('marine-ui-landing-kone-car-designer')}</h1>
        <p className="lead">{getText('marine-ui-landing-description-1')}</p>
        <p className="lead">{getText('marine-ui-landing-description-2')}</p>
        <Link
          to={`/${MARINE}/selections`}
          className="btn btn-kone-blue btn-full-width action-button"
        >
          {getText('ui-landing-design-now')}
        </Link>
      </header>
    </section>
  )
}

export default HeroMarine