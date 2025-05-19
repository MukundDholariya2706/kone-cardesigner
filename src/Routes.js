import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import './index.scss';
import 'jspolyfill-array.prototype.findIndex';
import 'array-flat-polyfill';

import React, { lazy, Suspense, useContext, useEffect } from 'react';
import { Route as PublicRoute, Redirect, Switch, useLocation, useParams } from "react-router-dom";


// Bundled pages
import Welcome from './pages/Welcome';
import Selections from './pages/Selections';
import SelectionsMarine from './pages/Selections/SelectionsMarine';
import PreDesigns from './pages/PreDesigns';
import ContactKone from './pages/ContactKone/ContactKone';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import DesignShare from './components/DesignShare'
import LoadingSpinner from './components/LoadingSpinner';
import { NEW_BUILDINGS, EXISTING_BUILDINGS } from './constants';
import MobileDownloadPage from './pages/MobileDownloadPage';
import GendocShareLoadingView from './components/GendocShareLoadingView/GendocShareLoadingView';
import DesignSpecification from './pages/DesignSpecification/components'
import Loader from './components/Loader';
import { AuthContext } from './store/auth';
import { DataContext } from './store/data';
import { DesignContext } from './store/design';
import { attemptAsync } from './utils/async-utils';

// Lazy pages
const Editor = lazyWithRetry(() => import('./pages/Editor'), 'Editor')
const ImageRendererPage = lazyWithRetry(() => import('./pages/ImageRendererPage'), 'ImageRendererPage')
const GeneratorPage = lazyWithRetry(() => import('./pages/GeneratorPage'), 'GeneratorPage')
const Provider2 = lazyWithRetry(() => import('./store/index2'), 'index2');

// buildingsType has to match one of these values (or can be omitted)
const buildingsTypeParam = `:buildingsType(${NEW_BUILDINGS}|${EXISTING_BUILDINGS})?`

function Routes(props) {

  return (
    <Switch>
      <PublicRoute path="/error" component={ErrorPage} />
      <PublicRoute path="/download" component={MobileDownloadPage} />
      <PublicRoute path="/marine/error" component={() => <ErrorPage marine={true} />} />
      <PublicRoute path="/contact" component={ContactKone} />
      <PublicRoute path="/marine/share/:designId" component={() => <DesignShare isMarine={true} />} />
      <PublicRoute path="/share/:designId" component={DesignShare} />
      <PublicRoute path="/doc/:designId" component={() => <DesignShare gendoc={true} />} exact={true} />

      <PublicRoute path="/" component={Welcome} exact />
      <PublicRoute path="/marine" component={() => <Welcome marine={true} />} exact />
      <CheckAuthRoute path={`/marine/selections`} component={SelectionsMarine} />
      <CheckAuthRoute path={`/${buildingsTypeParam}/selections`} component={Selections} />
      <CheckAuthRoute path={`/${buildingsTypeParam}/selections/global`} component={Selections} />
      <CheckAuthRoute path={`/${buildingsTypeParam}/:country/:product/:releaseId?/predesigns`} exact component={PreDesigns} />
      <PublicRoute 
        path={`/${buildingsTypeParam}/:country/:product/:releaseId?/specification/:designId`} 
        exact
        component={DesignSpecification} />
      <PublicRoute path={[
        '/doc/:designId/:mode',
        `/${buildingsTypeParam}/:country/:product/:releaseId?/specification/:designId/render`,
        `/${buildingsTypeParam}/:country/:product/:releaseId?/edit/blank`,
        `/${buildingsTypeParam}/:country/:product/:releaseId?/edit/:designId`,
        `/generator/:designId`,
      ]}>
        <Suspense fallback={<SuspenseFallback />}>

          <Provider2>
            <Switch>
              <PublicRoute path={[ // Not really a PublicRoute, but the auth logic is currently handled in the Editor component (wrong place...) TODO: Handle auth and redirection logic in the Router
                '/doc/:designId/:mode', // Gendoc viewer 
                `/${buildingsTypeParam}/:country/:product/:releaseId?/edit/:designId`
                ]}
              exact component={Editor}
              />
              <PublicRoute path="/generator/:designId" exact component={GeneratorPage} />
              <PublicRoute path={`/${buildingsTypeParam}/:country/:product/:releaseId?/specification/:designId/render`} exact component={ImageRendererPage} />
            </Switch>
          </Provider2>
        </Suspense>
      </PublicRoute>

      <Redirect from='/marine/*' to='/marine'></Redirect>
      <Redirect to='/'></Redirect>
    </Switch>
  )
}

// Ideally this or similar route component would be used for checking
// what pages can by accessed by the user throughout the application.
// However, Editor and DesignSpecification components already have
// their own logic (mostly duplicated...) for this purpose. 
// TODO remove redirection logic from view components and add to the Router wherever possible. 
function CheckAuthRoute({ accessibleWithDesign, accessibleWithEditableDesign, params: paramSettings, ...rest }) {
  const params = useParams()
  const auth = useContext(AuthContext)
  const settings = getAuthRouteSettings({ params, paramSettings, accessibleWithDesign, accessibleWithEditableDesign })

  const isAccessible = useIsAccessible(settings)

  useEffect(() => {
    if (!isAccessible) {
      auth.signIn(true)
    }
  }, [isAccessible])

  if (isAccessible) {
    return <PublicRoute {...rest} /> 
  }

  return null
}

function SuspenseFallback(props) {
  const location = useLocation()
  
  const progress = location.state?.progress || 0
  const isEditable = location.state?.isEditable

  if (location.pathname.includes('/doc/')) {
    // If refreshing the page on gendoc viewer page
    return (
      <GendocShareLoadingView progress={progress} isEditable={isEditable} />
    )
  }

  if (location.pathname.includes('/edit/')) {
    // Editor specific loader
    return <Loader progress={progress} />
  }

  // Default case
  return (
    <LoadingSpinner />
  )
}

/**
 * Checks if the route can be accessed based on the domain, design state, and auth state.
 * Only India domain has requireAuth=true. For any other domain, every route is accessible by anyone.
 * Any route can be accessed by a logged in user.
 * Some routes can be accessed with a valid design id (e.g. through a share link). This is specified with accessibleWithDesign option.
 * Other routes can be accessed only with a design that has been flagged as editableByPublic. This is specified with accessibleWithEditableDesign option.
 * accessibleWithEditableDesign is prioritized over accessibleWithDesign, i.e. if both are true, design must be flagged as editableByPublic. 
 * @param {Object} options 
 * @param {Object | boolean} options.accessibleWithDesign 
 * @param {Object | boolean} options.accessibleWithEditableDesign 
 * @returns 
 */
function useIsAccessible(options = {}) {
  const { domainCountry } = useContext(DataContext)
  const { loggedInUser } = useContext(AuthContext)
  const { design } = useContext(DesignContext)

  if (!domainCountry.requireAuth) return true
  if (loggedInUser) return true
  

  if (options.accessibleWithEditableDesign) {
    return !!design?.editableByPublic
  }

  if (options.accessibleWithDesign) {
    return !!design
  }

  return false
}

/**
 * Gets settings for specific route parameter value, or default settings if no parameter specific settings defined.
 */
function getAuthRouteSettings({ params, paramSettings, accessibleWithDesign, accessibleWithEditableDesign }) {
  let result

  if (paramSettings) {
    Object.entries(params).forEach(entry => {
      if (result) return
      const [ key, value ] = entry
      
      if (paramSettings[key]) {
        result = paramSettings[key][value]
      }
    })
  }

  if (!result) {
    return {
      accessibleWithDesign,
      accessibleWithEditableDesign
    }
  }

  return result
}


// Sometimes, rarely, React.lazy fails to load a JS chunk (that definitely exists) in production for some reason.
// Trying a few times before crashing.
function lazyWithRetry(componentImport, name) {
  return lazy(async () => {
    try {
      const component = await attemptAsync({
        fn: componentImport,
        retries: 3,
        delays: [1500, 3000, 4500]
      })
      
      return component
    } catch (err) {
      const item = localStorage.getItem('LAST_REFRESH')
      const now = Date.now()
      const oneMinute = 1000 * 60 * 1
      if (item && !isNaN(item)) {
        if (now - oneMinute < Number(item)) {
          // Only reload once in a minute so the app does not get stuck in a reload loop
          // if the loading never succeeds. Instead it should go to the error page.
          throw new Error(`Failed to load lazy component "${name}".`)
        }
      }

      // Store the reload time so we can check if we should reload or go to the error page next time.
      localStorage.setItem('LAST_REFRESH', String(now))
      window.location.reload()
    }
  })
}

export default Routes