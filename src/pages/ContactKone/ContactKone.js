import './ContactKone.scss'
import React, { useState, useContext, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRecaptcha } from '../../components/Recaptcha'
import FormInput from '../../components/FormInput'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import { UserContext } from '../../store/user/UserProvider'
import { DataContext } from '../../store/data/DataProvider'
import { OfferingContext } from '../../store/offering/OfferingProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import roles from '../../store/roles'
import { sortCountries } from '../../utils/generalUtils'

import { setAnalyticsForEvent } from '../../utils/analytics-utils'

import { formHandler, postContactForm, titles } from '../../utils/form-utils'
import Icon from '../../components/Icon'
import { SiteContext } from '../../store/site/SiteProvider'
import locationCountries from '../../store/locationCountries'
import { CONTACT_ACTION, US_STATES, CA_PROV_TERR } from '../../constants'
import { APIContext } from '../../store/api/APIProvider'
import { Honeypots } from '../../components/FormInput/FormInput'
import FormSelect from '../../components/FormSelect/FormSelect'
import FormRadio from '../../components/FormRadio/FormRadio'
import ToastContainer from '../../components/ToastContainer'
import { ToastContext } from '../../store/toast/ToastProvider'

let locationInitialized

const ContactKone = () => {
  const api = useContext(APIContext)
  const { getText } = useContext(TranslationContext)
  const { getPrivacyStatement, isMarine } = useContext(SiteContext)
  const { addToast } = useContext(ToastContext)

  const [contacted, setContacted] = useState(false)

  const [inputs, setInputs] = useState([])
  const [title, setTitle] = useState('none')
  const [business, setBusiness] = useState()
  const [usState, setUsState] = useState()
  const [provTerr, setProvTerr] = useState()
  const [sendClicked, setSendClicked] = useState(false)
  const executeRecaptcha = useRecaptcha(null, { visible: true })
  const kdi = window.location.href.indexOf('global') !== -1

  const { countries, domainCountry } = useContext(DataContext)

  const { location, setLocation, role, setRole } = useContext(UserContext)

  const { countryCode } = useContext(OfferingContext)

  const [selectedCountry, _setSelectedCountry] = useState()

  const locationToUse = useMemo(() => {
    if (location) return location

    if (locationInitialized) return locationInitialized

    if (selectedCountry && selectedCountry.alpha3 !== 'OTHER') {
      locationInitialized = selectedCountry.name
      return selectedCountry.name
    }

    return null
  }, [location, selectedCountry])

  const setSelectedCountry = (alpha3) => {
    if (!alpha3) {
      _setSelectedCountry(null)
      return
    }
    const result = countries.find((x) => x.alpha3 === alpha3)
    _setSelectedCountry(result)
  }

  const isSelected = () => {
    let count = 0
    if (locationToUse && locationToUse !== '' && locationToUse !== 'none') count++
    if (selectedCountry && selectedCountry.name !== '' && selectedCountry.name !== 'none') count++
    if (role && role !== '' && role !== 'none') count++
    return count
  }

  useEffect(() => {
    if (!countries) return
    // Related to recaptcha replacement.
    // So the backend knows where the user is.
    api.get('/check') 
  }, [countries])

  useEffect(() => {
    if (!countries) return
    setSelectedCountry(countryCode)
  }, [countries, countryCode])

  const onFormChange = (e) => {
    formHandler(e, inputs, setInputs)
  }
  
  const onSend = async (e) => {
    setSendClicked(true)
    const { recaptchaToken, recaptchaNumber } = await executeRecaptcha(CONTACT_ACTION)

    try {
      const response = await postContactForm({
        inputs: [
          ...inputs,
          { identifier: 'title', value: title },
          { identifier: 'location', value: locationToUse },
          { identifier: 'country', value: selectedCountry.name },
          { identifier: 'role', value: role },
          { identifier: 'business', value: business },
          { identifier: 'us_state', value: usState },
          { identifier: 'ca_prov_terr', value: provTerr },
        ],
        api,
        recaptchaToken,
        recaptchaNumber,
        domain: domainCountry.domain
      })

      console.log('response', response)
      setContacted(true)
      addToast({ message: getText('ui-general-contact-request-succesful') })
      setAnalyticsForEvent({
        eventName: 'Contact KONE',
        eventData: {
          location: locationToUse,
          role: role,
          projectCountry: selectedCountry.alpha3,
        },
      })
    } catch (error) {
      setSendClicked(false)
      addToast({ message: getText('ui-unexpected-error'), type: 'error' })
    }
  }


  const countryOptions = useMemo(() => {
    // TODO get this stuff from API instead of local file
    if (!locationCountries) return []
    return sortCountries(locationCountries, getText).map((country) => {
      return {
        text: getText(`country-${country.alpha3}`),
        value: country.name
      }
  })
  }, [locationCountries, getText])

  const projectCountryOptions = useMemo(() => {
    if (!countries) return []
    return sortCountries(countries, getText).filter(x => isMarine || x.hasOffering).map((country) => {
      return {
        text: getText(`country-${country.alpha3}`),
        value: country.alpha3
      }
  })
  }, [countries, getText])
  
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

  return (
    <Layout limitedWidth={true} showHeader={true} navBarLinkLabel={getText('ui-general-back')} navBarClassName="navbar-lg pr-4 pl-4">
        <div className="ContactKone content" >
          <ToastContainer pageWide={true} />
        <Card header={getText('ui-general-contact-kone')}>
        { !contacted ? (
            <div className="firstView">
              <div className="form">
                <FormRadio
                  className="form-item"
                  label={getText('ui-contact-building-type')}
                  onChange={(val) => setBusiness(val)}
                  required={true}
                  emptySelectionText={getText('ui-contact-select-building-type')}
                  options={[{ text: getText('ui-contact-new-building'), value: 'NEB'},{ text: getText('ui-contact-existing-building'), value: 'MOD'}]}
                  value={business || 'none'}
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-help')}
                  placeholder=""
                  maxlength="32000"
                  onChange={(e) => formHandler(e, inputs, setInputs)}
                  required={true}
                  textarea={true}
                  placeholder={getText('ui-contact-placeholder-your-question-here')}
                  identifier="helpMessage"
                />
                <FormSelect
                  className="form-item"
                  emptySelectionText={getText('ui-contact-select-title')}
                  label={getText('ui-contact-title')}
                  onChange={(val) => setTitle(val)}
                  options={titles.map(item => ({ text: getText(item.text), value: item.value }))}
                  value={title || 'none'}
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-first-name')}
                  placeholder=""
                  error={getText('ui-contact-error-first-name')}
                  onChange={(e) => onFormChange(e)}
                  maxlength="40"
                  identifier="firstName"
                />
                <Honeypots
                  onChange={(e) => onFormChange(e)}
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-last-name')}
                  placeholder=""
                  required={true}
                  error={getText('ui-contact-error-last-name')}
                  onChange={(e) => onFormChange(e)}
                  maxlength="80"
                  identifier="lastName"
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-email')}
                  placeholder=""
                  required={true}
                  error={getText('ui-contact-error-email')}
                  onChange={(e) => onFormChange(e)}
                  identifier="email"
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-company')}
                  placeholder=""
                  error={getText('ui-contact-error-company')}
                  onChange={(e) => onFormChange(e)}
                  maxlength="255"
                  identifier="company"
                />
                <FormInput
                  className="form-item"
                  header={getText('ui-contact-phone')}
                  placeholder="+xxxxxxxxxxx"
                  required={true}
                  error={getText('ui-contact-error-phone')}
                  onChange={(e) => onFormChange(e)}
                  identifier="phone"
                />
                
                <FormSelect
                  className="form-item"
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

                <FormSelect
                  className="form-item"
                  label={getText('ui-contact-role')}
                  onChange={(val) => setRole(val)}
                  emptySelectionText={getText('ui-general-select-role')}
                  required={true}
                  options={roles.map(item => ({ text: getText(item.name), value: item.id}))}
                  value={role || 'none'}
                />
                {kdi ? (
                  <FormInput
                    className="form-item"
                    header={getText('ui-general-project-country')}
                    placeholder=""
                    required={true}
                    error={getText('ui-contact-error-country')}
                    onChange={(e) => onFormChange(e)}
                    maxlength="50"
                    identifier="country"
                  />
                ) : (
                  <FormSelect
                    className="form-item"
                    label={getText('ui-general-project-country')}
                    onChange={(val) => setSelectedCountry(val)}
                    emptySelectionText={getText('ui-general-select-country')}
                    required={true}
                    options={projectCountryOptions}
                    value={(selectedCountry || {}).alpha3 || 'none'}
                  />
                )}

                <FormInput
                  className="form-item"
                  header={getText('ui-contact-city')}
                  placeholder=""
                  required={true}
                  error={getText('ui-contact-error-city')}
                  maxlength="40"
                  identifier="city"
                  onChange={(e) => onFormChange(e)}
                />
                <FormInput
                  className="form-item"
                  header={
                    locationToUse === 'USA'
                      ? getText('ui-contact-zip')
                      : getText('ui-contact-postal-code')
                  }
                  placeholder=""
                  required={true}
                  error={getText('ui-contact-error-zip')}
                  maxlength="10"
                  identifier="zipCode"
                  onChange={(e) => onFormChange(e)}
                />
                <div className="buttons">
                  <button
                    className={`send ${
                      inputs.filter((x) => x.required).length + isSelected() !==
                        9 || sendClicked
                        ? 'disabled'
                        : ''
                    }`}
                    onClick={(e) => onSend(e)}
                  >
                    {getText('ui-general-send')}
                  </button>
                </div>
                <p className="bottomText">{getText('ui-contact-response')}</p>
                <p className="privacy-statement">
                  {getText('ui-contact-privacy-statement-1')}
                  <a
                    className="readMore"
                    href={getPrivacyStatement()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &nbsp;
                    {getText('ui-contact-privacy-statement-2')}
                  </a>
                  {getText('ui-contact-privacy-statement-3')}
                </p>
              </div>
            </div>
          ) : (
            <div className="secondView">
              <div className="thankYouText">
                <p className="header">{getText('ui-general-thank-you')}</p>
                <p>{getText('ui-contact-thank-you-desc')}</p>
              </div>
              <div className="optionsContainer">
                <Link to="/edit">
                  <div className="Selection left">
                    <div>
                      <p>{getText('ui-general-create-new-design')}</p>
                      <div className="arrow">
                        <Icon id="icon-arrow-right" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

export default ContactKone
