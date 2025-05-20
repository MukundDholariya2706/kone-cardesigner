import './DownloadDialog.scss'
import React, { useState, useContext } from 'react'

import InfoBox from '../InfoBox'
import SecondDialogView from '../SecondDialogView'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import PdfGenerator from '../PdfGenerator'
import { useKeepPagePosition } from '../../utils/customHooks'
import LoadingSpinner from '../LoadingSpinner'
import Dialog, { DialogNotification, DialogBody, DialogFooter, DialogHead } from '../Dialog'
import Toast from '../Toast'
import DownloadDesignPDFButton from '../DownloadDesignPDFButton/DownloadDesignPDFButton'
import { DesignContext } from '../../store/design/DesignProvider'


const DownloadDialog = ({
  closed,
  onChange,
  documentLanguage
}) => {

  const { getText } = useContext(TranslationContext)
  const [downloaded, setDownloaded] = useState(false)
  const [close, setClose] = useState(closed)
  const designCtx = useContext(DesignContext)

  const [ error, setError ] = useState(null)
  const [ loadingPdf, setLoadingPdf ] = useState(false) 

  const pdfName = designCtx.designName?.replace(" ", "_").toLowerCase() + ".pdf" || 'Design.pdf'

  useKeepPagePosition()

  const closeDialog = (e) => {
    setClose(!close)
    onChange(false)
  }
  
  if (close) {
    return null
  }

  return (
    <>
      {!downloaded ? (
        <Dialog className="DownloadDialog" >
          <DialogNotification>
            {downloaded ? (
              <Toast
                message={ getText('ui-dialog-notification-download') }
              />
            ) : null}          
            {error ? (
              <Toast
                message={ getText('error-message-pdf-generation') }
                type="error"
              />
            ) : null}
          </DialogNotification>
          <DialogHead onClose={(e) => closeDialog(e)}>
            {getText('ui-dialog-download-specifications')}
          </DialogHead>
          <DialogBody>
            {loadingPdf ? (
                <div className="loading-spinner-container">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <InfoBox
                    icon="icon-tool"
                    header={pdfName}
                    text={'2.5MB'}
                  />
                </>
              )}
          </DialogBody>
          <DialogFooter>
            <div className="buttons">
              <DownloadDesignPDFButton 
                className="download"
                document={PdfGenerator}
                pdfName={pdfName}
                documentLanguage={documentLanguage}
                onClick={() => setLoadingPdf(true)}
                onGenerationFinished={(error) => {
                  setLoadingPdf(false)

                  if (error) {
                    setError(error)
                  } else {
                    setDownloaded(true)
                  }
                }}
              >
                {getText('ui-general-download')}
              </DownloadDesignPDFButton>
            </div>          
          </DialogFooter>

        </Dialog>
      ) : (
        <SecondDialogView onChange={(e) => closeDialog(e)} />
      )}
    </>
  )
}

export default DownloadDialog
