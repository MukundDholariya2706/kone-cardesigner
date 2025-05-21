import './PreDesigns.scss';

import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout/Layout';
import ToggleButtons from '../../components/ToggleButtons';

import LoadingSpinner from '../../components/LoadingSpinner'
import ProductChanger from '../../components/ProductChanger'
import Card from '../../components/Card';
import PreDesign from '../../components/PreDesign';

import { ProductContext } from '../../store/product/ProductProvider';
import { PREDESIGNS_PAGE_ACTION } from '../../constants';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { useRecaptcha } from '../../components/Recaptcha';
import { useProductFromURL, useBuildingsType } from '../../utils/customHooks/customHooks';

/**
 * Renders out the selections page. The page contains selection for project type and solution.
 * @param {Object} props Properties passed to the renderer
 */
const PreDesigns = (props) => {
  const { getText } = useContext(TranslationContext);
  const { error, product } = useContext(ProductContext);
  const [themes, setThemes] = useState([])
  const [localThemes, setLocalThemes] = useState([])
  const [view, setView] = useState('Predesigns')
  const { releaseId } = useProductFromURL(props.history)
  useRecaptcha(PREDESIGNS_PAGE_ACTION)

  const buildingsType = useBuildingsType()

  useEffect(() => {
    if (!product) {
      return
    }

    const themesArray = []
    const localThemesArray = []

    product.themes.forEach(theme => {      
      const designs = product.designs.filter(design => design.theme === theme.id)
      const item =  {
        id: theme.id,
        name: theme.name,
        sublabel: theme.sublabel,
        desc: theme.description,
        image: theme.image && theme.image.url,
        video: theme.video && theme.video.url,
        className: theme.class,
        items: designs,
        bgColor: theme.bgColor
      }

      if (theme.custom && designs.length > 0) {
        localThemesArray.push(item)
      } else if (designs.length > 0) {
        themesArray.push(item)
      }
    })
    setThemes(themesArray)
    setLocalThemes(localThemesArray)
    
    if (themesArray.length > 0) {
      setView('Predesigns')
    } else if (localThemesArray.length > 0) {
      setView('Local')
    } else {
      props.history.push(`/${buildingsType}/selections`)
    }

  }, [product])

  if (error) {
    return (<div className="error" >{error.message}</div>)
  }

  return (    
    
  <Layout 
      limitedWidth={true}
      showHeader={true} 
      stickyHeader={true}
      navBarLinkLabel={getText('ui-general-back')} 
      navBarClassName="navbar-lg pr-4 pl-4 predesigns"
      hideLinkOnMobile={true}
      showGiveFeedbackButton={true}
      navBarCenterChildren={ !releaseId &&
        <ProductChanger buildingsType={buildingsType} />
      }
      stickyNavBar={true} 
    >
      <div className="PreDesigns content">
        <Card header={getText('ui-selector-project-modify')}>
          { 
            themes.length > 0 && localThemes.length > 0 ? 
            <div className="toggleView">
              <ToggleButtons 
                content={[{value: 'Predesigns', label: getText('ui-gallery-kone-design-collection')}, {value: 'Local', label: getText('ui-gallery-local-kone-collection')}]} 
                selectedButton={view}
                type="underline"
                onChange={e => setView(e)} />  
            </div> :
            <div style={{ height:'30px' }} />
          }
          
          { !product && <LoadingSpinner /> }

          { view === 'Predesigns' && product &&
            themes.map(item => (
              item.items.length && 
              <PreDesign buildingsType={buildingsType} key={item.id} items={item.items} background={item.image} video={item.video} sublabel={item.sublabel}
                title={item.name} desc={item.desc} className={item.className}></PreDesign>
            ))
          }

          { view === 'Local' && product && 
            localThemes.map(item => (
              item.items.length && 
              <PreDesign buildingsType={buildingsType} key={item.id} items={item.items} background={item.image} bgColor={item.bgColor} video={item.video} sublabel={item.sublabel} localDesign={true}
                title={item.name} desc={item.desc} className={item.className}></PreDesign>
            )) 
          }

        </Card>
      </div>
  </Layout>


  )
}


export default PreDesigns;
