import './MirrorType.scss'
import React, {useContext} from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider'

const MirrorType = ({ types, enabledTypes = [],  selected, onChange }) => {
  const { getText } = useContext(TranslationContext)

  return (
      <div className="MirrorType">
      {(types || []).map( (type, key) => 
        <div className={'type' + (!enabledTypes || !(enabledTypes.find(item => item.id === type.id))?' disabled':'')} key={key} onClick={e => onChange(type.id)}>
          <div className={"thumbnail" + (type.id === selected ? ' tbSelection' : '')} style={{backgroundImage: `url(${type.image})`}}></div>
          <div className="description">{getText(type.description) }</div>
          <div className={"radioButton" + (type.id === selected ? ' rbSelection' : '')}>
            <div className={"innerRim" + (type.id === selected ? ' irSelection' : '')} />
          </div>
        </div>
      )}
      </div>
  )
}

export default MirrorType