import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../../components/Icon'
import { NEW_BUILDINGS } from '../../../../constants'
import { AuthContext } from '../../../../store/auth'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import './HeroIndia.scss'

function HeroIndia(props) {

  const { loggedInUser } = useContext(AuthContext)

  return (
    <section className="HeroIndia">
      { loggedInUser ?
        <LoggedInContent /> :
        <PublicContent />
      }
    </section>
  )
}

function PublicContent(props) {
  const { getText } = useContext(TranslationContext)
  return (
    <header className="hero-content">
      <h1 className="hero-section-title">{getText('ui-landing-i-series')}</h1>
      <h3 className="hero-subtitle">
        { getText('ui-landing-i-series-subtitle')}
      </h3>
      <div className="subtitles-container">
        <h3 className="hero-subtitle">{getText('ui-landing-i-monospace')}</h3>
        <h3 className="hero-subtitle">{getText('ui-landing-i-minispace')}</h3>
      </div>
      <p className="lead">{getText('ui-landing-i-series-description')}</p>
      <Link
        to={`/contact`}
        className="btn btn-kone-blue btn-full-width action-button"
      >
        {getText('ui-general-contact-us')}
      </Link>
      <a
        href={`https://www.kone.in/Images/KONE%20I%20Series%20product%20and%20design%20brochure_tcm152-101720.pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-transparent btn-full-width action-button"
      >
        <Icon className="btn-icon" id="icon-download" /> {getText('ui-general-download-brochure')}
      </a>
    </header>
  )
}

function LoggedInContent(props) {
  const { getText } = useContext(TranslationContext)
  return (
    <header className="hero-content">
      <h1 className="hero-section-title">{getText('ui-landing-new-buildings')}</h1>
      <p className="lead">{getText('ui-landing-new-buildings-description-1')}</p>
      <p className="lead">{getText('ui-landing-new-buildings-description-2')}</p>
      <Link
        to={`/${NEW_BUILDINGS}/selections`}
        className="btn btn-kone-blue btn-full-width action-button"
      >
        {getText('ui-landing-design-now')}
      </Link>
    </header>
  )
}

export default HeroIndia