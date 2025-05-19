import './CustomFinishNameDialog.scss'
import React, { useContext, useState } from 'react'
import { TranslationContext } from '../../store/translation';
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../Dialog';
import Button from '../Button';
import FormInput from '../FormInput';
import InfoBox from '../InfoBox';
import LoadingSpinner from '../LoadingSpinner';

const CustomFinishNameDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);
  const [ name, setName ] = useState('')
  const [ confirmSend, setConfirmSend ] = useState(false)

  return (
    <Dialog className="CustomFinishNameDialog">
      <DialogHead onClose={ confirmSend ? null : e => onCancel(e) }>
        { getText('ui-custom-name-finish') }
      </DialogHead>
      <DialogBody>
        { confirmSend && <LoadingSpinner /> }
        { !confirmSend && <>
          <FormInput        
            header={getText('ui-general-name')}
            placeholder=""
            onChange={ ({ value }) => {
              // FormInput needs to be improved 
              // 'invalid' is not appropriate return value
              if (value === 'invalid') {
                setName('')
              } else {
                setName(value)
              }
            } }
            maxlength="40"
            required="*"
            onEnterKeyPress={() => {
              if (!name.trim()) return
              onConfirm(({ name }))
            }}
          />
          <InfoBox text={getText('ui-custom-name-finish-info')} />
        </> }
      </DialogBody>
      <DialogFooter className="footer-buttons">
        <Button className="btn-cancel" disabled={confirmSend} inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={ e => onCancel && onCancel(e) } >{getText('ui-general-cancel')}</Button>
        <Button 
          disabled={!name.trim() || confirmSend} 
          inlineBlock={true} 
          theme={['sm', 'primary', 'center', 'uppercase']} 
          onClick={ e => {
            if (onConfirm && !confirmSend) {
              onConfirm({ name })
              setConfirmSend(true)
            }
          } }
        >
          {getText('ui-general-save')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default CustomFinishNameDialog