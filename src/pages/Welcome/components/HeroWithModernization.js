import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { EXISTING_BUILDINGS, NEW_BUILDINGS } from '../../../constants'
import { TranslationContext } from '../../../store/translation'

function HeroWithModernization(props) {
  const { getText } = useContext(TranslationContext)

  return (
    <section className="hero HeroWithModernization">
      <div className={'hero-section new-buildings' + (props.isEna ? ' ena' : '')}>
        <div className="lead-container">
          <h2 className="hero-section-title">{getText('ui-landing-new-buildings')}</h2>
          <p className="lead">{getText('ui-landing-new-buildings-description-1')}</p>
          <p className="lead">{getText('ui-landing-new-buildings-description-2')}</p>
        </div>
        <Link
          to={props.country === 'GLOBAL' ? `/${NEW_BUILDINGS}/selections/global` : `/${NEW_BUILDINGS}/selections`}
          className="btn btn-kone-blue"
        >
          {getText('ui-landing-design-now')}
        </Link>
      </div>
      <div className={'hero-section existing-buildings' + (props.isEna ? ' ena' : '')}>
        <div className="lead-container">
          <h2 className="hero-section-title">{getText('ui-landing-existing-buildings')}</h2>
          <p className="lead">{getText('ui-landing-existing-buildings-description-1')}</p>
          <p className="lead">{getText('ui-landing-existing-buildings-description-2')}</p>
        </div>
        <Link
          to={props.country === 'GLOBAL' ? `/${EXISTING_BUILDINGS}/selections/global` : `/${EXISTING_BUILDINGS}/selections`}
          className="btn btn-transparent"
        >
          {getText('ui-landing-design-now')}
        </Link>
      </div>
    </section>
  )
}

export default HeroWithModernization