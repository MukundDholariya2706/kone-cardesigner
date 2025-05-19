import './GendocEditWarningDialog.scss'
import React, { useContext } from 'react'
import { TranslationContext } from '../../store/translation';
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../Dialog';

const GendocEditWarningDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);

  return (
    <Dialog className="GendocEditWarningDialog">
      <DialogHead onClose={e => onCancel(e)}>
         { getText('ui-general-edit-design') }
      </DialogHead>
      <DialogBody>
        <p>{getText('ui-gendoc-warning-dialog-text')}</p>
      </DialogBody>
      <DialogFooter>
        <button className="btn-cancel" onClick={e => onCancel(e)}>{ getText('ui-general-cancel') }</button>
        <button className="btn-confirm" onClick={e => {
           onConfirm(e)
           onCancel() // Close the dialog
        }}>{ getText('ui-general-continue') }</button>
      </DialogFooter>
    </Dialog>
  )
}

export default GendocEditWarningDialog