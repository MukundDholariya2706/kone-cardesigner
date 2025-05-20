import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { TranslationContext } from '../../../store/translation/TranslationProvider'

function HeroNoModernization(props) {
  const { getText } = useContext(TranslationContext)

  return (
    <section className="hero-v1 HeroNoModernization">
      <div className="bg-container">
        <div className="bg"></div>
      </div>
      <header>
        <h1 className="hero-section-title">{getText('ui-landing-kone-car-designer')}</h1>
        <p className="lead">{getText('ui-landing-banner-desc')}</p>
        <Link
          to={props.country === 'GLOBAL' ? '/new-buildings/selections/global' : '/new-buildings/selections'}
          className="btn btn-transparent"
        >
          {getText('ui-general-enter')}
        </Link>
      </header>
    </section>
  )
}

export default HeroNoModernization