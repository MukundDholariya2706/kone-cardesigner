import React, { useContext, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ReportIssueDialog } from '../../components/FeedbackForms/FeedbackForms'
import Layout from '../../components/Layout'
import { ERROR_TYPES } from '../../constants'
import { SiteContext } from '../../store/site'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import { useErrorLogger } from '../../utils/customHooks/customHooks'
import './ErrorPage.scss'

function ErrorPage(props) {
  const { getText } = useContext(TranslationContext)
  const { isMarine } = useContext(SiteContext)

  const [showReportIssueDialog, setShowReportIssueDialog] = useState(false)
  return (
    <>
      <div className="ErrorPage">
        <Layout
          limitedWidth={true}
          showHeader={true}
          navBarLinkLabel=""
          navBarClassName="navbar-lg pr-4 pl-4"
          showNavBar={false}
        >
          <div className="error">
            <p className="head">{getText('ui-error-page-something-went-wrong')}</p>
            <span />
            <p className="info">
              {getText(
                'ui-error-page-text'
              )}
            </p>
            {props.reportButton && (
              <button onClick={() => setShowReportIssueDialog(true)} className="btn report-button">
                {getText('ui-error-page-report-issue')}
              </button>
            )}
            <a className="btn home-button" href={isMarine ? '/marine' : '/'}>
              {getText('ui-error-page-return-home')}
            </a>
          </div>
        </Layout>
      </div>
      {showReportIssueDialog && (
        <ReportIssueDialog onClose={() => setShowReportIssueDialog(false)} />
      )}
    </>
  )
}

function ErrorPageWrapper(props) {
  const logError = useErrorLogger()

  function errorHandler(error, info) {
    logError({
      message: error.message,
      stackTrace: error.stack,
      severity: ERROR_TYPES.FATAL,
    })
  }

  return (
    <ErrorBoundary
      FallbackComponent={(errorProps) => <ErrorPage reportButton={true} {...errorProps} />}
      onError={errorHandler}
    >
      {props.children}
    </ErrorBoundary>
  )
}

/* 
  This is only used at the very top level outside of any context providers so cannot use any contexts inside.
  For now cannot even see it even if a critical error happens because the body is set to have a display: none; until 
  required data has been loaded from the API. Anyway in 99.9999% of crashes the other error handler should work so
  maybe this isn't really necessary for now...
*/
function CriticalError(props) {
  return <h1>Critical error</h1>
}

export function CriticalErrorPage(props) {
  return <ErrorBoundary FallbackComponent={CriticalError}>{props.children}</ErrorBoundary>
}

export default ErrorPageWrapper
