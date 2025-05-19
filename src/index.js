import 'array-flat-polyfill'
// TODO how to make sure that the importing order is correct???
import 'react-app-polyfill/ie11' // This must be imported before any React stuff 
import 'react-app-polyfill/stable' // This must be imported before any React stuff
import Bowser from 'bowser'
import 'jspolyfill-array.prototype.findIndex'
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, useLocation } from 'react-router-dom'
import { ReactComponent as Icons } from './assets/icons-bundle.svg'
import App from './components/App'
import UnsupportedBrowser from './components/UnsupportedBrowser'
import './index.scss'
import ErrorPage, { CriticalErrorPage } from './pages/ErrorPage/ErrorPage'
import Routes from './Routes'
import * as serviceWorker from './serviceWorker'
import Provider from './store'

const BrowserCheck = ({ children, component: Component }) => {
  const browser = Bowser.getParser(window.navigator.userAgent)
  const unsupportedBrowsers = ['Internet Explorer']

  const location = useLocation()
  if (unsupportedBrowsers.includes(browser.getBrowserName()) && location.pathname !== '/download') {
    document.body.style.display = 'block'

    return <UnsupportedBrowser />
  }
  return children
}

if (process.env.NODE_ENV === 'production') {
  const savedConsole = console
 
  console = {}
  console.log = () => {}
  console.group = () => {}
  console.groupCollapsed  = () => {}
  console.groupEnd   = () => {}
  console.warn = () => {}
  console.error = () => {}
  console.trace = () => {}

  window.enableLogs = () => {
    console.log = savedConsole.log
    console.group = savedConsole.group
    console.groupCollapsed  = savedConsole.groupCollapsed 
    console.groupEnd   = savedConsole.groupEnd 
    console.warn = savedConsole.warn
    console.error = savedConsole.error
    console.trace = savedConsole.trace
  }
}

ReactDOM.render(
  <HashRouter>
    <CriticalErrorPage>
      <Provider>
        <BrowserCheck>
          <ErrorPage>
            <App>
              <Routes />
            </App>
          </ErrorPage>
        </BrowserCheck>
      </Provider>
    </CriticalErrorPage>
    {/* Cache icons here ... use later (see Icon component) */}
    <Icons style={{ display: 'none' }} />
  </HashRouter>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
