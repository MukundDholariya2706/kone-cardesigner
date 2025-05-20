import React, { useState, useContext, useMemo } from 'react'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import { sortCountries } from '../../../../utils/generalUtils'
import Button from '../../../../components/Button'
import Container from '../../../../components/Container'
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../../../../components/Dialog'
import FormSelect from '../../../../components/FormSelect'
import Sprite from '../../../../components/Sprite'
import iconQuestion from '../../../../assets/icons/icon-question.png'
import iconQuestion2x from '../../../../assets/icons/icon-question@2x.png'

import './LocationAndRoleDialog.scss'
import { useKeepPagePosition } from '../../../../utils/customHooks'
import Map from '../../../../components/Map'
import Icon from '../../../../components/Icon'
import { AuthContext } from '../../../../store/auth'


function LocationAndRoleDialog(props) {
  const { className = '', onCancel, onConfirm, role: initRole, roles, country: initCountry, countries } = props

  const { getText } = useContext(TranslationContext)
  const { loggedInUser } = useContext(AuthContext)

  useKeepPagePosition()

  const [ role, setRole ] = useState(initRole)

  const [ country, setCountry ] = useState(initCountry)

  const roleImage = useMemo(() => {
    if (!role) return null
    const found = roles.find(x => x.id === role)
    
    if (!found) return null
    return found.image
  }, [role])

  // TODO remove hardcoding if more than one KONE role later. For now always forced to 'sales'
  function filterRoles(roleItem) {
    if (!loggedInUser) return true

    return roleItem.id === 'sales'
  }

  function sortRoles(role1, role2) {
    if (!role1.id || !role2.id) return 0

    // 'sales' (= KONE employee) should be first. Others not specified
    if (role1.id === 'sales') return -1
    if (role2.id === 'sales') return 1
    return 0
  }

  return (
    <Dialog className={ `LocationAndRoleDialog ${className}` }>
      <DialogHead onClose={ onCancel ? e => onCancel(e) : undefined }>
        { getText('ui-selector-lets-get-started') }
      </DialogHead>
      <DialogBody>
        <Container className="content-container">
          <div className="section country-section">
            <Map countryCode={country} />
            <div className="section-image-container">
              <Icon id="icon-map-location" className="map-icon" />
            </div>
            <div className="section-content">
              <h2 className="section-title">
                { getText('ui-selector-select-work-location') }
              </h2>
              <p className="section-description">
                { getText('ui-selector-work-location-description')}
              </p>
              <FormSelect
                className="location-select"
                searchable={true}
                onChange={(val) => setCountry(val)}
                emptySelectionText={getText('ui-general-select-country')}
                options={sortCountries(countries, getText).map(country => {
                  return {
                    value: country.alpha3,
                    text: getText(`country-${country.alpha3}`),
                    group: getText(`region-${country.regionCode}`)
                  }
                })}
                value={country}
              />
            </div>
          </div>
          <div className="section role-section">
            <div className="section-image-container">
              { role && roleImage ? 
              <Sprite className="role-image" src={roleImage} /> :
              <Sprite src={iconQuestion} src2x={iconQuestion2x} />
            }
            </div>
            <div className="section-content">
              <h2 className="section-title">
                { getText('ui-selector-what-is-your-role') }
              </h2>
              <p className="section-description">
                { getText('ui-selector-tell-us-about-yourself-long')}
              </p>
              <FormSelect
                className="role-select"
                onChange={(val) => setRole(val)}
                emptySelectionText={getText('ui-general-select-role')}
                options={roles
                  .filter(filterRoles)
                  .sort(sortRoles)
                  .map(item => ({ text: getText(item.name), value: item.id}))
                }
                value={role}
              />
            </div>
          </div>
        </Container>
      </DialogBody>
      <DialogFooter className="footer-buttons">        
        <Button inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={ e => onCancel && onCancel(e) } >{getText('ui-general-cancel')}</Button>
        <Button disabled={!role || !country || country === 'none'} onClick={() => onConfirm({ country, role})} inlineBlock={true} theme={['sm', 'primary', 'center', 'uppercase']} >{getText('ui-general-save')}</Button>
      </DialogFooter>
    </Dialog>
  )
}

export default LocationAndRoleDialog