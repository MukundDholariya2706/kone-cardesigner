import React, { useState, useContext, useRef, useEffect } from 'react'
import { DesignContext } from '../../store/design/DesignProvider'
import { LayoutContext } from '../../store/layout'
import { ProductContext } from '../../store/product/ProductProvider'
import { ToastContext } from '../../store/toast/ToastProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import { useIsDesignEditable } from '../../utils/customHooks/customHooks'
import { formatTime, getDisplayNameAndRole, getPhoneNumber } from '../../utils/generalUtils'
import Button from '../Button'
import DesignInfo from '../DesignInfo/DesignInfo'

import '../EditPanel/EditPanel.scss'
import Icon from '../Icon'
import ScrollBox from '../ScrollBox'
import './DesignInfoPanel.scss'

function formatDate(timestamp) {
  if (!timestamp) return '-'

  const date = new Date(timestamp)


  return date.toLocaleDateString()
}

function getSalesPersonNameAndRole(salesPerson = {}) {
  const { name, role } = salesPerson

  let result = ''

  if (name) {
    result += name
  }

  if (name && role) {
    result += `, ${role}`
  }

  return result
}

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function DesignInfoPanel(props) {
  const {
    className = '',
    onEditClick,
  } = props

  const scrollBoxRef = useRef()
  const [showDesignDetails, setShowDesignDetails] = useState(false)
  const { getText } = useContext(TranslationContext)
  const { design } = useContext(DesignContext)
  const layout = useContext(LayoutContext)
  const productStore = useContext(ProductContext)
  const { addToast } = useContext(ToastContext)

  const { tenderInfo, owner } = design

  const canEdit = useIsDesignEditable()

  let contactPerson

  if (tenderInfo?.salesPerson) {
    contactPerson = {
      nameAndRole: getSalesPersonNameAndRole(tenderInfo.salesPerson),
      email: tenderInfo.salesPerson.email,
      phone: tenderInfo.salesPerson.phone
    }
  } else if (owner) {
    contactPerson = {
      nameAndRole: getDisplayNameAndRole(owner),
      email: owner.mail,
      phone: getPhoneNumber(owner)
    }
  }

  let MainInfo

  if (tenderInfo?.tender) {
    MainInfo = () => (<>
      <h3 className="tender-info-header">
        {getText('ui-gendoc-tender-proposal-for')}
      </h3>
      <p className="tender-info-opportunity-name">
        {tenderInfo.tender.opportunityName}
      </p>
      <p className="tender-info-numbers">
        {tenderInfo.tender.opportunityNumber} / {tenderInfo.tender.tenderNumber}-v{tenderInfo.tender.tenderVersion}
      </p>
      <h3 className="tender-info-header">
        {getText('ui-gendoc-tender-date-of-creation')}
      </h3>
      <p>{formatDate(tenderInfo.tender.dateOfCreation)}</p>
    </>)
  } else if (owner) {
    MainInfo = () => (<>
      <h3 className="tender-info-header">
        {getText('ui-general-car-design')}
      </h3>
      <p>
        {getText(design.name)}
      </p>
      <div className="half-width">
        <h3 className="tender-info-header">
          {getText('ui-gendoc-tender-date-of-creation')}
        </h3>
        <p>{formatTime(design.createdAt)}</p>
      </div>
      <div className="half-width">
        <h3 className="tender-info-header">
          {getText('ui-general-link-expiration-date')}
        </h3>
        <p>{formatTime(design.expiresAt)}</p>
      </div>
    </>)
  }

  function togglePanelVisibility() {
    layout.setEditPanelOpen(prev => !prev)
  }

  // Only matters in mobile view
  function toggleDesignDetails() {
    setShowDesignDetails(prev => !prev)
  }

  useEffect(() => {
    if (!scrollBoxRef.current?.scrollTo) return

    scrollBoxRef.current.scrollTo(0, 0)
  }, [showDesignDetails, scrollBoxRef])

  useEffect(() => {
    if (canEdit) return

    addToast({ type: 'info',  message: getText('ui-general-not-editable-info') })
  }, [canEdit])

  return (
    <div data-testid="DesignInfoPanel" className={`DesignInfoPanel ${className} ${layout.editPanelOpen ? 'panel-open' : 'panel-closed'}`}>
      <div className={`panel-content-container ${canEdit ? 'with-button' : ''}`}>
        <div className="heading-container">
          <h1>{getText('ui-gendoc-design-info-panel-heading')}</h1>
        </div>
        <ScrollBox ref={scrollBoxRef} className="content-container">
          {MainInfo &&
            <div data-testid="tender-info-section" className={`section tender-info-section ${showDesignDetails ? 'mobile-hidden' : 'mobile-visible'}`}>
              <div className="tender-info-container">
                <MainInfo />
                <h3 className="tender-info-header">
                  {getText('ui-gendoc-tender-your-contact')}
                </h3>
                <p>{contactPerson.nameAndRole}</p>
                <div className="contact-info">
                  {contactPerson.email &&
                    <div className="contact-info-block">
                      <Icon id="icon-contact" /> {contactPerson.email}
                    </div>
                  }
                  {
                    contactPerson.phone &&
                    <div className="contact-info-block">
                      <Icon id="icon-handset" /> {contactPerson.phone}
                    </div>
                  }
                </div>
              </div>
            </div>}
          {/* Only visible on mobile */}
          <div data-testid="design-details-toggle" onClick={toggleDesignDetails} className={`section section-toggle ${showDesignDetails ? 'toggle-open' : 'toggle-closed'}`}>
            {getText('ui-gendoc-design-info-panel-design-details')}
            <Icon id="icon-select" />
          </div>
          <div data-testid="design-info-section" className={`section design-info-section ${showDesignDetails ? 'mobile-visible' : 'mobile-hidden'}`}>
            <h2 className="section-header" >
              {getText('ui-gendoc-design-info-panel-design-details')}
            </h2>
            <h3 className="model">{getText(productStore.product.name)}</h3>
            <p className="desc">{getText(productStore.product.description)}</p>
            <DesignInfo />
          </div>
        </ScrollBox>
        { canEdit && <div className="action-buttons">
          <Button
            icon="icon-edit-pen"
            onClick={onEditClick}
            theme={['sm', 'outline', 'center', 'with-icon']} >
            {getText('ui-general-edit-design')}
          </Button>
        </div>}
      </div>
      <div className="open-close-toggle" onClick={togglePanelVisibility}>
        <div className="open-close-toggle-bg"></div>
        <div className="button">
          {layout.editPanelOpen ? <Icon id="icon-chevron-left" /> : <Icon id="icon-menu" />}
        </div>
      </div>
    </div>
  )
}

export default DesignInfoPanel