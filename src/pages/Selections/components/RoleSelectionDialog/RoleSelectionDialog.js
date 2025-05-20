import React, { useState, useContext } from 'react'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import Button from '../../../../components/Button'
import Container from '../../../../components/Container'
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../../../../components/Dialog'
import GridComponent from '../../../../components/GridComponent/GridComponent'
import SelectableCard from '../../../../components/SelectableCard'

import './RoleSelectionDialog.scss'
import { useKeepPagePosition } from '../../../../utils/customHooks';

function RoleSelectionDialog(props) {
  const { className = '', onCancel, onConfirm, role: initRole, roles } = props

  const { getText } = useContext(TranslationContext)
  
  useKeepPagePosition()

  const [ role, setRole ] = useState(initRole)

  return (
    <Dialog className={ `RoleSelectionDialog ${className}`}>
      <DialogHead onClose={ onCancel ? e => onCancel(e) : undefined }>
        { getText('ui-selector-what-is-your-role') }
      </DialogHead>
      <DialogBody>
        <Container>
          <p>
            { getText('ui-selector-tell-us-about-yourself-long')}
          </p>
          <GridComponent gap="sm" cols={3} tabletCols={2}>
            { roles.map(({ id, name, image }) => 
              <SelectableCard key={id} selected={id === role} image={image} onClick={ e => setRole(id) } selectText={getText('ui-general-select')} selectedText={getText('ui-general-selected')}>{getText(name)}</SelectableCard>
            ) }
          </GridComponent>
        </Container>
      </DialogBody>
      <DialogFooter className="footer-buttons">        
        <Button inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={ e => onCancel && onCancel(e) } >{getText('ui-general-cancel')}</Button>
        <Button disabled={!role} onClick={() => onConfirm(role)} inlineBlock={true} theme={['sm', 'primary', 'center', 'uppercase']} >{getText('ui-general-save')}</Button>
      </DialogFooter>
    </Dialog>
  )
}

export default RoleSelectionDialog