import React, { useContext } from 'react'
import Icon from '../../../../components/Icon'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'

import './TenderInfo.scss'

/* 
  {
      salesPerson: {
        name: 'Wolfgang A. Mozart',
        role: 'Composer',
        email: 'mozart@kone.com',
        phone: '+32 1756 1791'
      },
      tender: {
        opportunityName: '1160 Wien, Fröbelgasse 6',
        customerName: 'Atelier Kaindl + Kuntner GmbH',
        opportunityNumber: '0002918631',
        tenderNumber: 'T-0004159524',
        tenderVersion: '1',
      }
    }

*/

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 * @param {Object} props.salesPerson 
 * @param {string} props.salesPerson.name 
 * @param {string} props.salesPerson.role 
 * @param {string} props.salesPerson.email 
 * @param {string} props.salesPerson.phone 
 * @param {Object} props.tender
 * @param {string} props.tender.opportunityName
 * @param {string} props.tender.customerName
 * @param {string} props.tender.opportunityNumber
 * @param {string} props.tender.tenderNumber
 * @param {string} props.tender.tenderVersion
 */
function TenderInfo(props) {
  const {
    className = '',
    salesPerson,
    tender
  } = props

  const { getText } = useContext(TranslationContext)

  return (
    <div data-testid="TenderInfo" className={`TenderInfo ${className}`}>
      <div className="tender-container">
        <p className="tender-container__header">
          <span>{tender.customerName},</span> <span>{tender.opportunityName}</span>
        </p>
        <p className="tender-container__numbers">
          {tender.opportunityNumber} | {tender.tenderNumber}-v{tender.tenderVersion}
        </p>
      </div>
      <div className="person-container">
        <p className="person-container__header">
          {getText('ui-tender-info-your-contact')}
        </p>
        <p>{salesPerson.name}, {salesPerson.role}</p>
        <div className="person-container__contact-info">
          <div className="contact-info-block">
            <Icon id="icon-contact" /> {salesPerson.email}
          </div>
          <div className="contact-info-block">
            <Icon id="icon-handset" /> {salesPerson.phone}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenderInfo