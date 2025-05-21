import './InfoDialog.scss'
import React, { useState, useContext, useMemo } from 'react'
import { TranslationContext } from '../../../../store/translation/TranslationProvider';
import { useKeepPagePosition } from '../../../../utils/customHooks'
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../../../../components/Dialog';
import reviewDesignImage from '../../../../assets/images/share-link-dialog/react.svg'
import updateDesignImage from '../../../../assets/images/share-link-dialog/react.svg'
import contactAboutDesignImage from '../../../../assets/images/share-link-dialog/react.svg'
import FormSelect from '../../../../components/FormSelect'
import Button from '../../../../components/Button';
import Sprite from '../../../../components/Sprite';
import iconQuestion from '../../../../assets/icons/react.svg'
import iconQuestion2x from '../../../../assets/icons/react.svg'

const InfoDialog = ({ onClose, ktoc, roles, currentRole, setNewRole, loggedInUser }) => {
  const { getText } = useContext(TranslationContext);
  const [ role, setRole ] = useState(currentRole)
  useKeepPagePosition()
console.log(loggedInUser)
  const closeDialog = (e) => {
    onClose()
  }

  const handleRoleChange = () => {
    setNewRole(role)
  }
  const roleImage = useMemo(() => {
    if (!role) return null
    const found = roles.find(x => x.id === role)
    
    if (!found) return null
    return found.image
  }, [role])

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

  console.log(role, ' -- ', currentRole)
  return (
    <Dialog className={`InfoDialog`} >

      <DialogHead onClose={ onClose ? e => closeDialog(e) : undefined }>
      { currentRole
        ? getText('ui-info-dialog-main-heading')
        : getText('ui-lets-get-started')
      }
      </DialogHead>
      <DialogBody>
        {!currentRole &&
          <div className="section role-section">
            <div className="section-image-container">
              { role && roleImage ? 
                <Sprite className="role-image" src={roleImage} /> :
                <Sprite src={iconQuestion} src2x={iconQuestion2x} />
              }
            </div>
            <div className="section-content">
              <h2 className="section-title">
                { getText('ui-what-is-your-role-with-no-star') }
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
        }
        { currentRole && 
          <>
            <InfoItem 
              imageSrc={reviewDesignImage}
              title={getText('ui-info-dialog-heading-review')} 
              text={getText('ui-info-dialog-desc-review')} />
            <InfoItem 
              imageSrc={updateDesignImage}
              title={getText('ui-info-dialog-heading-update')} 
              text={getText('ui-info-dialog-desc-update')} />
            <InfoItem 
              imageSrc={contactAboutDesignImage}
              title={getText('ui-info-dialog-heading-contact')} 
              text={getText('ui-info-dialog-desc-contact')} />
          </>
        }
      </DialogBody>
      <DialogFooter className="footer-buttons">
        {currentRole 
          ? <Button inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={closeDialog} >{getText('ui-general-ok-long')}</Button>
          : <Button inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={() => handleRoleChange() } >{getText('ui-general-next')}</Button>
        }
        
      </DialogFooter>

    </Dialog>
  )
}

function InfoItem(props) {
  const {
    imageSrc,
    title,
    text,
    className = '',
  } = props

  return (
    <div className={`InfoItem ${className}`}>
      <div className="image-container">
        <Sprite src={imageSrc} />
      </div>
      <div className="content-container">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default InfoDialog