import React, {  useContext } from 'react'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import { getDisplayNameAndRole, getPhoneNumber } from '../../../../utils/generalUtils'
import Icon from '../../../Icon'
import Layout from '../../../Layout'

import './ExpiredLinkError.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function ExpiredLinkError(props) {
  const {
    className = '',
    owner
  } = props

  const { getText } = useContext(TranslationContext)

  const phoneNumber = getPhoneNumber(owner)
  const nameAndRole = getDisplayNameAndRole(owner)

  return (
    <Layout
      limitedWidth={true}
      showHeader={true}
      navBarLinkLabel=""
      navBarClassName="navbar-lg pr-4 pl-4"
      showNavBar={false}
    >
      <div data-testid="ExpiredLinkError" className={`ExpiredLinkError ${className}`}>
        <h1 className="ExpiredLinkError__heading">{getText('ui-error-page-link-expired-heading')}</h1>
        <p className="ExpiredLinkError__info">{getText('ui-error-page-link-expired-info')}</p>
        {owner &&
          <div className="ExpiredLinkError__contact-box">
            <h3 className="ExpiredLinkError__sales-contact-heading">
              {getText('ui-general-your-sales-contact')}
            </h3>
            {
              nameAndRole?.length > 0 &&
              <p className="ExpiredLinkError__name-and-role">{nameAndRole}</p>
            }
            {
              (!!owner.mail || !!phoneNumber) &&
              <div className="contact-info">
                {owner.mail &&
                  <div className="contact-info-block ExpiredLinkError__email">
                    <Icon id="icon-contact" /> {owner.mail}
                  </div>
                }
                {
                  phoneNumber &&
                  <div className="contact-info-block ExpiredLinkError__phone-number">
                    <Icon id="icon-handset" /> {phoneNumber}
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </Layout>
  )
}

export default ExpiredLinkError