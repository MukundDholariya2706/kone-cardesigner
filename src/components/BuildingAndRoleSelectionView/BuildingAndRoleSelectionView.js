import './BuildingAndRoleSelectionView.scss'

import React, {useContext } from 'react'
import GridComponent from '../GridComponent/GridComponent'
import SelectableCard from '../SelectableCard'
import Container from '../Container'
import { TranslationContext } from '../../store/translation'


const BuildingAndRoleSelectionView = props => {
  const { buildingType, setBuildingType, marine, buildingTypes } = props
  const { getText } = useContext(TranslationContext);

  return (
    <div className="BuildingAndRoleSelectionView">
      <Container hPadding="xlg">
        <h2> {marine ? 
          getText('marine-ui-selector-type-of-vessel') :
          getText('ui-selector-type-of-building')}</h2>
        <BuildingTypesGrid
          buildingType={buildingType}
          setBuildingType={setBuildingType}
          buildingTypes={buildingTypes}
          getText={getText}
          marine={marine}
        />
      </Container>
      
    </div>
  )
}

function BuildingTypesGrid(props) {
  const { buildingTypes, getText, buildingType, setBuildingType, marine } = props

  return (
    <GridComponent 
      className="building-type-grid" 
      gap="sm" 
      cols={marine ? 3 : 5} 
      tabletCols={3}>
      { buildingTypes.map(({ id, name, image }) => 
        <SelectableCard 
          key={id} 
          selected={id === buildingType} 
          image={image} 
          imageStyle={marine ? 'full' : 'normal'}
          onClick={ e => setBuildingType(id) } 
          selectText={getText('ui-general-select')} 
          selectedText={getText('ui-general-selected')} >
            {getText(name)}
          </SelectableCard>
      ) }
    </GridComponent>
  )
}





export default BuildingAndRoleSelectionView