import React, { useState, useContext, useRef, useMemo } from 'react'
import { AuthContext } from '../../store/auth/AuthProvider'
import { useOnClickOutside } from '../../utils/customHooks'
import Dialog, { DialogHead, DialogBody } from '../Dialog';
import Button from '../Button'
import Icon from '../Icon'
import './LoginComponent.scss'
import { TranslationContext } from '../../store/translation/TranslationProvider';

const LoginComponent = (props) => {
  const { cardFromTop, redirectOnLogin = true } = props
  const { loggedInUser, profilePhoto, signIn, signOut } = useContext(AuthContext)
  const [ isOpen, setIsOpen ] = useState(false) 
  const [ dialogOpen, setDialogOpen ] = useState(false)
  const { getText } = useContext(TranslationContext)

  return (
    <div className={`LoginComponent ${isOpen ? 'isOpen' : ''}`}>
      <LoginDialog 
          closed={!dialogOpen} 
          closeDialog={() => setDialogOpen(false)}
          getText={getText}
          signIn={signIn}
          redirectOnLogin={redirectOnLogin}
        />
      { loggedInUser ?
        <SignOutComponent
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          getText={getText}
          loggedInUser={loggedInUser}
          signOut={signOut}
          cardFromTop={cardFromTop}
          profilePhoto={profilePhoto}
        /> :
        <div className="login-button" onClick={() => setDialogOpen(true)}>
          <Icon id="icon-login" />
        </div>
        
      }
    </div>
  )
}

const SignOutComponent = props => {
  const { getText, loggedInUser, signOut, isOpen, setIsOpen, cardFromTop, profilePhoto } = props
  
  const initials = useMemo(() => {
    if (!loggedInUser) return '-'
    
    if (loggedInUser.givenName && loggedInUser.surname) {
      return (loggedInUser.givenName[0] + loggedInUser.surname[0]).toUpperCase()
    }

    return loggedInUser.displayName?.split(' ')
      .map(name => name[0])
      .filter(x => x !== '(') // Filter out "(EXT)"
      .join('')
      .toUpperCase() || '-'
  }, [loggedInUser])

  const outerDiv = useRef()
  useOnClickOutside(outerDiv, () => setIsOpen(false))

  return (
    <div ref={outerDiv} 
      className={`SignOutComponent ${isOpen ? 'isOpen' : ''}`}>
      <Button
        onClick={() => setIsOpen(prev => !prev)}
        className={`SignOutComponent__button`}
        theme={['primary', 'circle']}
      >{initials}</Button>
      {
        isOpen &&
        <div
          style={{top: cardFromTop}} 
          className="SignOutComponent__profile-card">
          <div className="profile-thumbnail">
            { profilePhoto ? 
              <img src={profilePhoto} /> :
              initials
            }
            </div>
          <div className="profile-card-right">
            <p className="profile-card-header">{loggedInUser.displayName}</p>
            <p className="profile-card-email">{loggedInUser.mail}</p>
            <div>
              <Button 
                className="profile-card-sign-out" 
                icon="icon-logout" 
                theme={['link']} 
                onClick={() => signOut()}>
                  {getText('ui-general-sign-out')}
                </Button>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

const LoginDialog = props => {
  const { closed, closeDialog, getText, signIn, redirectOnLogin } = props
  if (closed) return null

  async function handleClick() {
    await signIn(redirectOnLogin)
    closeDialog()
  }

  return (
    <Dialog className="LoginDialog">
      <DialogHead onClose={e => closeDialog(e)}>
        <span className="LoginDialog__header">
          <Icon id="icon-login" />
          {getText('ui-general-sign-in-dialog-title')}
        </span>
      </DialogHead>
      <DialogBody 
        className="LoginDialog__body">
        {getText('ui-general-sign-in-dialog-info')}
        <Button 
          theme={['primary', 'center', 'sm']}
          className="LoginDialog__button"
          onClick={handleClick}>
            {getText('ui-general-sign-in-dialog-button')}
        </Button>
      </DialogBody>
    </Dialog>
  )
}

export default LoginComponent