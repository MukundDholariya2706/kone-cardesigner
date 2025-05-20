import './ShareDialog.scss'
import React, { useState, useContext, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FormInput from '../FormInput';
import SecondDialogView from '../SecondDialogView';
import { formHandler } from '../../utils/form-utils';
import { sendEmail } from '../../utils/email-utils';
import { OfferingContext } from '../../store/offering'
import { DataContext } from '../../store/data/DataProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { UserContext } from '../../store/user/UserProvider';
import { SHARE_DIALOG_ACTION } from '../../constants'
import { useKeepPagePosition } from '../../utils/customHooks';
import { APIContext } from '../../store/api';
import { setAnalyticsForEvent} from '../../utils/analytics-utils'
import useRecaptcha from '../Recaptcha/useRecaptcha';
import Dialog, { DialogHead, DialogBody, DialogFooter, DialogNotification } from '../Dialog';
import { Honeypots } from '../FormInput/FormInput';
import { SiteContext } from '../../store/site';
import { ProductContext } from '../../store/product/ProductProvider';
import Toast from '../Toast';
import Icon from '../Icon';

const ShareDialog = ({ closed, design = {}, designName, designId, onChange, carImage, designUrl, designSaved }) => {
  
  const { getText } = useContext(TranslationContext);
  const api = useContext(APIContext)
  const { language } = useContext(UserContext)
  const { isMarine } = useContext(SiteContext)
  const productCtx = useContext(ProductContext)
  const [emailSent, setEmailSent] = useState(false)
  const [close, setClose] = useState(closed)
  const [inputs, setInputs] = useState([])
  const [message, setMessage] = useState()
  const [copied, setCopied] = useState(false)
  const [emailError, setEmailError] = useState()
  const [sendClicked, setSendClicked] = useState(false)
  const executeRecaptcha = useRecaptcha(undefined, { visible: true })
  useKeepPagePosition()

  const { countryCode } = useContext(OfferingContext)
  const { countries } = useContext(DataContext)

  // Get the full country name for the selected countrycode.
  const countryFromList = countries.find(item => item.alpha3 === countryCode)
  const country = countryFromList ? countryFromList.name : 'global'

  useEffect(() => {
    if (!sendClicked || !designSaved) return

    setEmailError(null)

    handleSend()
      .finally(() => {
        setSendClicked(false)
      })

  }, [sendClicked, designSaved])

  const closeDialog = (e) => {
    setClose(!close)
    onChange(false)
  }

  const onFormChange = (e) => {
    formHandler(e, inputs, setInputs)
  }

  async function handleSend() {

    const inputsObject = inputs.reduce((prev, curr) => {
      prev[curr.identifier] = curr.value
      return prev
    }, {})
    
    try {
      const { recaptchaToken, recaptchaNumber } = await executeRecaptcha(
        SHARE_DIALOG_ACTION
      )
      const response = await sendEmail({
        fields: {
          ...inputsObject,
          emailTo: inputsObject.email,
          emailSubject: getText('mail-subject'),
          emailMessage: message,
          designName: getText(designName),
          designTheme: getText(design.themeName),
          product: productCtx.product.name,
          productDesc: productCtx.product.description,
          isMarine,
          country,
          designId,
          image: carImage,
          languageCode: language.code,
          recaptchaToken,
          recaptchaNumber,
        },
        api
      })

      setEmailSent(true) // Causes the success message to be displayed.
      setAnalyticsForEvent({
        eventName: 'Share your design - Email',
        eventData:{}
      })
    } catch (err) {
      setEmailError(err)
    }
  }

  const notify = () => {
    setCopied(true)
  }

  const getFullUrl = (id) => {
    return `${window.location.origin}/#/share/${id}`
  }

  if (close) {
    return null
  }

  return (
    <>

      { ( !emailSent ) ? (
        <Dialog className="ShareDialog">
          <DialogNotification>
            { copied ? <Toast type="default" message={getText('ui-dialog-notification-copied')} autoDismiss={4000} /> : null }
            { emailError ? <Toast message={getText('ui-unexpected-error')} type="error" autoDismiss={null} /> : null }
          </DialogNotification>
          <DialogHead onClose={e => closeDialog(e)}>
            { getText('ui-dialog-share') }
          </DialogHead>
          <DialogBody>          
            <div className="form">
              <FormInput 
                header={getText('ui-contact-send-to-email')} 
                placeholder="" 
                required={true} 
                error={getText('ui-contact-error-email')} 
                onChange={e => onFormChange(e)}
                identifier="email" />
              <FormInput header={getText('ui-contact-message')} placeholder="" required={false} onChange={e => setMessage(e.value)} textarea={true} />
              <Honeypots onChange={e => onFormChange(e)} />
            </div>
            <div className="getLink">{getText('ui-dialog-get-link')}</div>
            <div className="shareLink">
              <div className="shareIcon">
                <Icon id="icon-share-url" />
              </div>
              <div className="link">
                {
                  designSaved && designId ?
                <a href={designUrl} target="_blank" rel="noopener noreferrer">{designUrl}</a> :
                  <p className="link-placeholder">{getText('ui-dialog-loading-url')}</p>
                }
                <p>{getText('ui-dialog-anyone-with-link')}</p>
              </div>
              {designSaved && designId &&
                <CopyToClipboard text={designUrl} onCopy={e => {
                    notify()
                    setAnalyticsForEvent({
                      eventName: 'Share your design - Copy Link',
                      eventdata: {}
                    })              
                  }}>
                  <div className="copy">
                    { getText('ui-dialog-copy-link') }
                  </div>
                </CopyToClipboard>
              }
            </div>              
          </DialogBody>
          <DialogFooter className="buttons">

            <button className={`send ${((inputs.filter((x) => x.required).length !== 1  || sendClicked) ? 'disabled' : '')}`} onClick={e => setSendClicked(true)}>{getText('ui-general-send')}</button>
          </DialogFooter>
        </Dialog>
      ) : (
        <SecondDialogView succesfullySentView={true} onChange={e => closeDialog(e)} />
      ) }
    </>
  )
}

export default ShareDialog