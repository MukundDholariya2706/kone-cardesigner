import './Alert.scss'
import React, { useContext } from 'react'
import { TranslationContext } from '../../store/translation';
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../Dialog';
import Button from '../Button';

const Alert = ({ className, title, description, onCancel, onConfirm, onOk, onClose, cancelLabel='ui-general-cancel' }) => {
  const { getText } = useContext(TranslationContext);

  return (
    <Dialog className={ 'Alert' + ( className ? ` ${className}` : '' ) }>
      <DialogHead onClose={ onClose ? e => onClose(e) : undefined }>
        { getText(title) }
      </DialogHead>
      <DialogBody>
        { typeof description === 'string' && getText(description) }
        { typeof description !== 'string' && description }
      </DialogBody>
      <DialogFooter className="footer-buttons">        
        { onCancel && <Button inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={ e => onCancel && onCancel(e) } >{getText(cancelLabel)}</Button> }
        { onConfirm && <Button inlineBlock={true} theme={['sm', 'primary', 'center', 'uppercase']} onClick={ e => onConfirm && onConfirm(e) } >{getText('ui-general-yes')}</Button> }
        { onOk && <Button inlineBlock={true} theme={['sm', 'primary', 'center', 'uppercase']} onClick={ e => onOk && onOk(e) } >{getText('ui-general-ok')}</Button> }
      </DialogFooter>
    </Dialog>
  )
}

export default Alert