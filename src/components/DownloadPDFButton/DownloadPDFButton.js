import React, { useEffect, useState, useRef, useMemo } from 'react'
import {  PDFDownloadLink } from '@react-pdf/renderer'

import './DownloadPDFButton.scss'

/**
 * 
 * @param {Object} props 
 * @param {*} props.document
 * @param {Object=} props.documentProps
 * @param {String} props.pdfName
 * @param {*=} props.children
 * @param {string=} props.loadingText Text to display when PDF is being generated
 * @param {boolean=} props.disabled
 * @param {string=} props.className
 * @param {Function=} props.loadPdfData - Asyncronous function that returns a promise for the data to pass into the pdf document.
 * @param {Function=} props.onGenerationFinished - Function to run after the pdf generation has finishes.
 * @param {Function=} props.onClick - Function to run on click before starting to load PDF data
 */
function DownloadPDFButton(props) {
  const {
    onGenerationFinished = () => {},
    onClick = () => {},
    document: Document,
    documentProps = {},
    pdfName = 'Document',
    children,
    disabled,
    className = '',
    loadPdfData,
    loadingText,
  } = props

  const buttonRef = useRef()
  const [ loaded, setLoaded ] = useState(false)
  const [ clicked, setClicked ] = useState(false)
  const [ downloaded, setDownloaded ] = useState(false)
  const [ pdfData, setPdfData ] = useState(null)
  const [ error, setError ] = useState(null)
  const [ pdfReadyToBeDownloaded, setPdfReadyToBeDownloaded ] = useState(false)

  const downloadDisabled = useMemo(() => {
    // if (loadingPDFTranslations) return true
    if (clicked) return true
    if (error) return true
    if (disabled) return true

    return false
  }, [disabled, clicked, error])

  async function reset(err) {
    setPdfReadyToBeDownloaded(false)
    setClicked(false)
    setLoaded(false)

    if (!err) {
      setDownloaded(true)
    }

    onGenerationFinished(err)
  }

  function handleClick(e) {
    onClick(e)
    setClicked(true)
  }


  useEffect(() => {
    if (!loaded) return

    // Timeout is needed to make sure that the button being clicked has been
    // rendered.
    setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.click()
      }
      reset()
    }, 0)
  }, [loaded])

  useEffect(() => {
    if (error) {
      reset(error)
    }
  }, [error])

  useEffect(() => {
    if (!clicked) return

    if (!loadPdfData) {
      setPdfReadyToBeDownloaded(true)
      return
    }

    loadPdfData().then(data => {
      setPdfData(data)
      setPdfReadyToBeDownloaded(true)
    }).catch(err => {
      reset(err)
    })
  }, [clicked])

  return (
    <div onClick={handleClick} data-testid="DownloadPDFButton" className={`DownloadPDFButton ${downloaded ? 'downloaded' : ''} ${downloadDisabled ? 'disabled' : ''} ${className}`}>
      { clicked && loadingText ? loadingText : children }
      {pdfReadyToBeDownloaded && (
        <PDFDownloadLink
          className="download-link"
          document={
            <ErrorBoundary setError={setError}>
              <Document {...documentProps} data={pdfData} /> 
            </ErrorBoundary>
          }
          fileName={ pdfName }
        >
          {({ blob, url, loading, error: err }) => {
            if (err) {
              // This probably never happens? Any possible error is caught in the ErrorBoundary above
              console.error('Error when generating PDF', err)
              setError(err)
              return
            }

            if (loading) return

            // Allow document render to complete. (Gets rid of bad set state error.)
            // TODO better solution? Maybe could update react-pdf to v2 and use usePDF hook to clean up the code?
            setTimeout(() => {
              setLoaded(true)
            }, 0)

            return <button className="hidden-button" ref={buttonRef}></button>
          }}
        </PDFDownloadLink>
      )}
    </div>          
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error when generating the PDF', error)
    this.props.setError(error)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children; 
  }
}

export default DownloadPDFButton

