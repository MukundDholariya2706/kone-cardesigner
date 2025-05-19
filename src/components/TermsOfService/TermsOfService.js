import React, { useState, useMemo } from 'react'
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../Dialog'
import Container from '../Container'
import Button from '../Button'

import './TermsOfService.scss'
import Checkbox from '../Checkbox'

const TERMS_OF_SERVICE_COOKIE_NAME = 'TermsOfServiceCookie'

/**
 * Wrapper for a button-like element that displays terms of service
 * dialog when clicked if the terms of service have not yet been accepted by the user.
 * @param {Object} props 
 * @param {JSX.Element} props.children - A child with onClick property
 * @param {string=} props.dialogClassName 
 * @param {Function} props.getText 
 */
function TermsOfService(props) {
  const { 
    children, 
    dialogClassName,
    getText,
  } = props

  const [ showDialog, setShowDialog ] = useState(false)

  const childOnClick = useMemo(() => {
    const arr = React.Children.toArray(children)
    
    const child = arr.find(x => x.props && x.props.onClick)

    if (!child) {
      throw new Error('No child found with onClick property')
    }

    return child.props.onClick
  }, [children])

  function handleClick(e) {
    e.stopPropagation()
    
    const cookie = document.cookie.split(';').find((item) => item.trim().startsWith(`${TERMS_OF_SERVICE_COOKIE_NAME}=`))

    if (cookie) {
      // Cookie already set --> just perform the action directly
      childOnClick()
    } else {
      setShowDialog(true)
    }

  }
  
  function handleConfirm() {
    document.cookie = `${TERMS_OF_SERVICE_COOKIE_NAME}=true; expires=Fri, 31 Dec 9999 23:59:59 GMT`

    setShowDialog(false)
    childOnClick()
  }

  function handleCancel() {
    setShowDialog(false)
  }

  return (
    <>
    { React.cloneElement( children, { onClick: handleClick } ) }
     { showDialog && 
      <TermsOfServiceDialog 
          className={dialogClassName}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          getText={getText}
        />
      }
    </>
  )
}

function TermsOfServiceDialog(props) {
  const { 
    className = '',
    onCancel,
    onConfirm,
    getText
  } = props

  const [ agreed, setAgreed ] = useState(false)

  return (
    <Dialog className={ 'TermsOfServiceDialog' + ( className ? ` ${className}` : '' ) }>
      <DialogHead onClose={ onCancel ? e => onCancel(e) : undefined }>
        { getText('ui-terms-of-service-header') }
      </DialogHead>
      <DialogBody>
        <Container>
          <p>
            { getText('ui-terms-of-service-content')}
          </p>
          <Checkbox 
            labelText={getText('ui-accept-terms-of-service')}
            onChange={setAgreed}
            selected={agreed}
          />
        </Container>
      </DialogBody>
      <DialogFooter>
        <Button className="btn-cancel" inlineBlock={true} theme={['sm', 'outline', 'center', 'uppercase']} onClick={ e => onCancel && onCancel(e) } >{getText('ui-general-cancel')}</Button>
        <Button disabled={!agreed} onClick={() => onConfirm()} inlineBlock={true} theme={['sm', 'primary', 'center', 'uppercase']} >{getText('ui-general-continue')}</Button>
      </DialogFooter>
    </Dialog>
  )
}

export default TermsOfService