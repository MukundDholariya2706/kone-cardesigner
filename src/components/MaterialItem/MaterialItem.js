import './MaterialItem.scss'
import React, {useContext} from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Sprite from '../Sprite';


const MaterialItem = ({ materials, onChange, selectedItem, selectedId, labelField = 'name' }) => {
    
    const { getText } = useContext(TranslationContext);    
    
    if (!materials || !materials.length) {
        return null
    }
    if (selectedItem && !selectedId) {
        selectedId = selectedItem.id
    }

    return (
        <>
            {(materials || []).map((material, key) => (    
                <div className="MaterialItem" key={key}>
                    <div className="materialItem" onClick={onChange.bind(this, material.id)}>
                        <div className={'materialIcon' + (material.id === selectedId ? ' selectedIcon':'')}>
                            <Sprite src={material.image} alt="" />
                        </div>
                        <div className={'materialLabel' + (material.id === selectedId ? ' selectedLabel':'')}>
                            {getText(material[labelField])}
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default MaterialItem