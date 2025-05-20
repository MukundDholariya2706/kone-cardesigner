import './UnsavedChangesDialog.scss'
import React, { useContext } from 'react'
import { Link } from "react-router-dom";
import { DesignContext } from '../../store/design/DesignProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { getLink } from '../../utils/link-utils'
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../Dialog';

const UnsavedChangesDialog = ({ onCancel, onReset, onConfirm, reset = false }) => {
  const { getText } = useContext(TranslationContext);
  const { design, edited } = useContext(DesignContext)

  return (
    <Dialog className="UnsavedChangesDialog">
      <DialogHead onClose={e => onCancel(e)}>
        { reset ? getText('ui-dialog-will-be-lost') : getText('ui-dialog-exit-confirm') }
      </DialogHead>
      <DialogBody>
        { reset ? 
          (<p>{getText('ui-dialog-will-be-lost')}</p>) : 
          (
            <>
              <p>{getText('ui-dialog-by-selecting-exit')}</p>
              <p>{getText('ui-dialog-restore-work')}</p>
            </>
          ) 
        }
      </DialogBody>
      <DialogFooter>
        { reset ? 
          <>            
            <button className="btn-cancel" onClick={e => onCancel(e)}>{getText('ui-general-cancel')}</button>
            <button className="btn-reset" onClick={e => onReset(e)}>{getText('ui-dialog-reset-anyway')}</button>
          </> : 
          <>
            <Link className="btn-download" to={ getLink(design, edited) }>{ getText('ui-general-download') }</Link>
            <button className="btn-cancel" onClick={e => onCancel(e)}>{ getText('ui-general-cancel') }</button>
            <button className="btn-exit" onClick={e => onConfirm(e)}>{ getText('ui-general-exit') }</button>
          </>
        }
      </DialogFooter>
    </Dialog>
  )
}

export default UnsavedChangesDialog