import React, {Component} from 'react';
import './MaterialList.scss';

import Sprite from '../Sprite';
import Icon from '../Icon';
import ListComponent from '../ListComponent';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';

/**
 * Renders out the MaterialList component
 * - uses opened as state
 * @module MaterialList Editpanel renderer
 * @param {Array} selectedItem Selected item in the list
 * @param {Array} materials List on items
 * @param {function} onChange Function called when item is clicked
 */
class MaterialList extends Component {
  state = {
    opened: false
  }

  forceListOpen = () => {
    this.setState({opened:true});
  };

  forceListClose = () => {
    this.setState({opened:false});
  };

  componentDidMount() {
    if (this.props.initState) {
      this.setState(this.props.initState)
    }
  }

  render() {
    let { selectedItem, selectedId, onChange, materials, nullSelection, options, noImage=false, translation, className, labelField = 'label' } = this.props;

    if (selectedId && !selectedItem) {
      selectedItem = (materials || []).find(item => item.id === selectedId) || {}
    }
    const {
      state: {
          opened
      }
    } = this;

    const changeOpenClickHandler = () => {
      this.setState({opened:!opened});
    };

    // TODO: refactor the material list, now it's a mess
    // gridType=true draws the finish list with new components
    let materialItems;
    if(options && options.gridType) {

      materialItems = (!materials || materials.length < 1)
        ? ''
        : <ListComponent gap="sm" >
            <GridComponent cols="3" gap="sm" padding="md">
            {
              materials.map((material,key) => {
                return (
                  <TileComponent 
                    key={key} 
                    title={translation.getText(material[labelField])} 
                    image={material.image} 
                    icon={material.premium && "icon-premium"}
                    iconTitle={translation.getText('ui-general-extended-lead-time')} 
                    selected={(selectedItem && material.id === selectedItem.id)} 
                    onClick={onChange.bind(this, material.id)} 
                  /> 
                )
              })
            }
            </GridComponent>
          </ListComponent>
          
    } else {
      materialItems = (!materials)? '' : materials.map((material,key) => {      
          const isSelected = selectedItem && material.id === selectedItem.id
          return (
            <React.Fragment key={key}>
              { (material.id !== '[SEPARATOR]') 
              ?
                <div className={`materialListItem ${isSelected ? 'materialListItem--selected' : ''}`} onClick={onChange.bind(this, material.id)}>

                  <div className={"materialItem" + (options && options.description ? ' border' : '')}>
                    {(!noImage) && ( (options && options.squareIcon)
                      ? (<div className="materialIconSquare">
                          <Sprite src={material.image} />
                        </div>)
                      :(<div className={'materialIcon' + (isSelected ? ' selectedIcon':'')}>
                          <Sprite src={material.image} />
                        </div>) )
                    }
  
                    {options && options.description ?
                      <div className={'materialLabelDescription' + (selectedItem && material.id === selectedItem.id ? ' selectedLabel':'')}>
                        {material[labelField] && <p>{translation.getText(material[labelField])}</p>}
                        <p className="description">{(options && options.description && translation) && translation.getText(material.description)}</p>
                    </div> 
                    :
                    <div className={'materialLabel' + (selectedItem && material.id === selectedItem.id ? ' selectedLabel':'')}>
                      {translation ? translation.getText(material[labelField]) : (material[labelField])}
                    </div>
                    }
  
                  </div>
                  {(material && options && !options.premium) &&
                    (material.premium && <div className="premium">{translation && translation.getText('ui-general-premium')}</div>)
                  }

                </div>
              :
                <div className="materialListItem">
                  <div className="materialSeparator" style={options.description ? { display: 'none'} : null }>
                    <div className="materialSeparatorLabel">
                        {translation.getText(material[labelField])}
                    </div>
                    <div className="materialSeparatorPremium">
                      {/* (material.sublabel)?translation.getText(material.sublabel):'' */}
                    </div>
                  </div>
                </div>
              }
            </React.Fragment>
          )
      })
    }

    const materialHeader = 
      (
        <li className="accordion-list__item">
          <div className={'accordion-item'+ (opened ? ' accordion-item-opened': '') +( (options && options.gridType) ?' large' :'') + (!materials?' disabled':'')} >
            <div className={'accordion-item-line'+ ( (opened && options && options.gridType) ?' large' :'')} onClick={(materials)?changeOpenClickHandler:(e=>{})}>
              <div className={'accordion-item-title'}>
                <div className="materialItem">
                  { 
                    (!noImage) && ( (options && options.squareIcon) ?
                      <div className={'materialIconSquare' +( (options && options.gridType) ?' large' :'')}>
                        <Sprite src={(materials) ? ( (selectedItem && selectedItem.image) ? selectedItem.image : ((nullSelection || {}).selectedNull || {}).image ) : ((nullSelection || {}).listNull || {}).image} />
                      </div> : 
                      <div className="materialIcon">
                        <Sprite src={(materials) ? ( (selectedItem && selectedItem.image) ? selectedItem.image : ((nullSelection || {}).selectedNull || {}).image ) : ((nullSelection || {}).listNull || {}).image} />
                      </div> 
                    )
                  }                  
                  <div className="materialLabel">{(materials) ? ( (selectedItem && selectedItem[labelField] ) ? 
                    (translation ? translation.getText(selectedItem[labelField]):selectedItem[labelField] ) : ((nullSelection ||{}).selectedNull || {})[labelField]) : 
                    ((nullSelection || {}).listNull || {})[labelField]}</div>
                </div>
                <div className={'accordion-item-icon' +( (options && options.gridType) ?' large' :'')}>
                  <Icon style={{fill: '#0071b9'}} id="icon-chevron-down" />
                </div>
              </div>
            </div>
            <div className="accordion-item-inner">
                <div className="accordion-item-content">
                    {materialItems}
                </div>
            </div>
          </div>
        </li>
      )
  
    return (
      <div className={"MaterialList" + (className ? ` ${className}` : '')}>
        <ul className="accordion-list">
          {materialHeader}
        </ul>
      </div>
    )
  }
}

export default MaterialList;
