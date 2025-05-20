import './ContactDialog.scss'
import React, { useState, useContext, useMemo } from 'react'
import { useRecaptcha } from '../Recaptcha'
import FormInput from '../FormInput';
import SecondDialogView from '../SecondDialogView';
import { UserContext } from '../../store/user/UserProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { DataContext } from '../../store/data/DataProvider';
import { formHandler, postContactForm, titles } from '../../utils/form-utils';
import { SiteContext } from '../../store/site/SiteProvider';
import { CONTACT_ACTION, US_STATES, CA_PROV_TERR } from '../../constants';
import { useKeepPagePosition } from '../../utils/customHooks';
import { APIContext } from '../../store/api/APIProvider';
import roles from '../../store/roles';
import locationCountries from '../../store/locationCountries';
import { sortCountries } from '../../utils/generalUtils'
import Dialog, { DialogHead, DialogNotification, DialogBody, DialogFooter } from '../Dialog';
import { Honeypots } from '../FormInput/FormInput';
import FormSelect from '../FormSelect/FormSelect';
import Button from '../Button';
import Toast from '../Toast';

const ContactDialog = ({ closed, onChange, designName, design, designUrl }) => {
  const api = useContext(APIContext)
  const { getText } = useContext(TranslationContext);
  const { getPrivacyStatement, isMarine } = useContext(SiteContext);
  const [contacted, setContacted] = useState(false)
  const [close, setClose] = useState(closed)
  const [title, setTitle] = useState('none')
  const [usState, setUsState] = useState()
  const [provTerr, setProvTerr] = useState()
  const [inputs, setInputs] = useState([])
  const [sendClicked, setSendClicked] = useState(false)
  const [error, setError] = useState()
  const executeRecaptcha = useRecaptcha(undefined, { visible: true })
  const { countries, countryName, domainCountry } = useContext(DataContext)
  const { location, setLocation, setRole, role, buildingType } = useContext(UserContext)

  const locationToUse = useMemo(() => {
    if (location) return location

    if (countryName) {
      return countryName
    }

    return null
  }, [location, countryName])

  const sendDisabled = useMemo(() => {
    return sendClicked || inputs.filter(x => x.required).length !== 7 || !locationToUse || !role
  }, [sendClicked, inputs, locationToUse, role])

  const countryOptions = useMemo(() => {
    if (!countries) return []
    // TODO get this stuff from API instead of local file
    return sortCountries(locationCountries, getText).map((country) => {
      return {
        text: getText(`country-${country.alpha3}`),
        value: country.name
      }
  })
  }, [locationCountries, getText])

  const usStateOptions = US_STATES.map(item => {
    return {
      text: getText(`state-${item.value}`),
      value: item.value
    }
  })

  const provinceTerritoryOptions = CA_PROV_TERR.map(item => {
    return {
      text: getText(`province-territory-${item.value}`),
      value: item.value
    }

  })

  useKeepPagePosition()

  const closeDialog = () => {
   
    setClose(!close)
    onChange(false)
  }

  function onCancel() {
    closeDialog()
  }

  const onFormChange = (e) => {
    formHandler(e, inputs, setInputs)
  }

  const onSend = async (e) => {
    setError(false) // If there was an error, clear it out first. It gets reset if errors again, displaying the error notification again.
    setSendClicked(true)
    try {
      const { recaptchaToken, recaptchaNumber } = await executeRecaptcha(CONTACT_ACTION)
      const response = await postContactForm({
        inputs: [
          ...inputs,
          { identifier: 'title', value: title },
          { identifier: 'location', value: locationToUse },
          { identifier: 'design', value: design },
          { identifier: 'country', value: isMarine ? locationToUse : countryName },
          { identifier: 'designUrl', value: designUrl },
          { identifier: 'role', value: role },
          { identifier: 'buildingType', value: buildingType },
          { identifier: 'marine', value: isMarine },
          { identifier: 'us_state', value: usState },
          { identifier: 'ca_prov_terr', value: provTerr },
        ],
        api,
        recaptchaToken,
        recaptchaNumber,
        domain: domainCountry.domain,
      })

      console.log('response', response)
      setContacted(true)
    } catch (err) {
      setSendClicked(false)
      setError(err)
    }
  }

  if (!close) return (
    <>
        {!contacted ?
          <>
          <Dialog className={`ContactDialog ${contacted ? 'contacted' : ''}`} >
            <DialogNotification>
              {contacted ? <Toast message={getText('ui-general-thank-you-contact')} type="default" /> : null}
              {error ? <Toast message={getText('ui-unexpected-error')} type="error" autoDismiss={null} /> : null}
            </DialogNotification>
            <DialogHead onClose={() => closeDialog()}>
              {getText('ui-general-contact-us-about-design')}
            </DialogHead>
            
            <DialogBody className="firstView">
                            
              <div className="form">
                {/* <p>{getText('ui-contact-response')}</p> */}
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-help')}
                  placeholder={getText('ui-contact-placeholder-your-question-here')} required={true}
                  maxlength="32000"
                  onChange={e => formHandler(e, inputs, setInputs)} textarea={true} identifier="helpMessage"
                />
                <h4 className="form-section-header">{ getText('ui-contact-heading-your-details') }</h4>
                <FormSelect
                  className="form-item half-width"
                  emptySelectionText={getText('ui-contact-select-title')}
                  label={getText('ui-contact-title')}
                  onChange={(val) => setTitle(val)}
                  options={titles.map(item => ({ text: getText(item.text), value: item.value }))}
                  value={title || 'none'}
                />
                <FormSelect
                  className="form-item"
                  label={getText('ui-contact-role')}
                  onChange={(val) => setRole(val)}
                  emptySelectionText={getText('ui-general-select-role')}
                  required={true}
                  options={roles.map(item => ({ text: getText(item.name), value: item.id}))}
                  value={role || 'none'}
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-first-name')}
                  placeholder="" required={true} error={getText('ui-contact-error-first-name')}
                  onChange={e => onFormChange(e)}
                  maxlength="40"
                  identifier="firstName"
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-last-name')}
                  placeholder="" required={true} error={getText('ui-contact-error-last-name')}
                  onChange={e => onFormChange(e)}
                  maxlength="80"
                  identifier="lastName"
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-email')}
                  placeholder="" required={true} error={getText('ui-contact-error-email')}
                  onChange={e => onFormChange(e)}
                  identifier="email"
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-company')}
                  placeholder="" required={false} error={getText('ui-contact-error-company')}
                  onChange={e => onFormChange(e)}
                  maxlength="255"
                  identifier="company"
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-phone')}
                  placeholder="+xxxxxxxxxxx" required={true} error={getText('ui-contact-error-phone')}
                  onChange={e => onFormChange(e)}
                  identifier="phone"

                />
                <Honeypots onChange={e => onFormChange(e)} />
                <FormSelect
                  className="form-item half-width"
                  label={getText('ui-contact-your-location')}
                  onChange={(val) => setLocation(val)}
                  emptySelectionText={getText('ui-contact-your-location')}
                  required={true}
                  options={countryOptions}
                  value={locationToUse || 'none'}
                />

                {locationToUse === 'United States' &&
                  <FormSelect
                    className="form-item"
                    emptySelectionText={getText('ui-contact-select-state')}
                    label={getText('ui-contact-your-state')}
                    onChange={(val) => setUsState(val)}
                    required={true}
                    options={usStateOptions}
                    value={usState || 'none'}
                  />
                }

                {locationToUse === 'Canada' &&
                  <FormSelect
                    className="form-item"
                    emptySelectionText={getText('ui-contact-select-province-territory')}
                    label={getText('ui-contact-your-province-territory')}
                    onChange={(val) => setProvTerr(val)}
                    options={provinceTerritoryOptions}
                    required={true}
                    value={provTerr || 'none'}
                  />
                }

                <FormInput
                  className="form-item half-width"
                  header={getText('ui-contact-city')}
                  placeholder="" required={true}
                  error={getText('ui-contact-error-city')}
                  maxlength="40"
                  identifier="city" onChange={e => onFormChange(e)} />
                <FormInput
                  className="form-item half-width"
                  header={locationToUse === 'USA' ? getText('ui-contact-zip') : getText('ui-contact-postal-code')}
                  placeholder=""
                  required={true}
                  error={getText('ui-contact-error-zip')}
                  maxlength="10"
                  identifier="zipCode" onChange={e => onFormChange(e)} />
                <p className="privacy-statement">
                  {getText('ui-contact-privacy-statement-1')}
                  <a className="readMore" href={getPrivacyStatement()} target="_blank" rel="noopener noreferrer">
                    &nbsp;
                            {getText('ui-contact-privacy-statement-2')}
                  </a>
                  {getText('ui-contact-privacy-statement-3')}
                </p>
              </div>
            </DialogBody>
            <DialogFooter className="footer-buttons">
                <Button inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={ () => onCancel && onCancel() } >{getText('ui-general-cancel')}</Button>
                <Button disabled={sendDisabled} onClick={onSend} inlineBlock={true} theme={['sm', 'primary', 'center', 'uppercase']} >{getText('ui-general-send')}</Button>
            </DialogFooter>
            </Dialog>
          </>
          :
          <SecondDialogView succesfullySentView={true} contact={true} onChange={() => closeDialog()} />
        }
    </>
  )
  else return null
}

export default ContactDialog