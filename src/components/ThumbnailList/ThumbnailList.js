import React, {useState, useEffect, useContext} from 'react';
import './ThumbnailList.scss';
import MaterialItem from '../MaterialItem'
import { TranslationContext } from '../../store/translation';
import Sprite from '../Sprite';

/**
 * Renders out the ThumbnailList 
 * @function ThumbnailList Editpanel renderer
 * @param {Object} selectedItem Currently selected item
 * @param {Array} thumbnails List on thumbnails
 * @param {function} onChange Function called when item is clicked
 */
const ThumbnailList = ({ thumbnails, selectedId, onChange, finishes, selectedFinish, onFinishSelect, listOpen = () => {}, expandable, showBorder=false, showDescription=false, closeOnSame=false }) => {

    const { getText } = useContext(TranslationContext)
    const [closed, setClosed] = useState(true)

    const onClickHandler = (id) => {
        if(closeOnSame) {
            setClosed(true)
        }
        onChange(id)
    }

    useEffect(()=> {
        if(selectedId) {
            setClosed(true)
        } 
    }, [selectedId])

    useEffect(()=> {
        listOpen(!closed)
    },[closed])

    const selectedItem = (!thumbnails) ? '' : thumbnails.filter(item => item.id === selectedId)
    
    const thumbnailItems = (!thumbnails) ? '' : thumbnails.map((item, key) => {      
        if(item.id === "[SEPARATOR]") {
            return null;
        }        
        return (
            <div className="thumbnailItemContainer" key={key}>
                <div className={'thumbnailItem' + (showBorder ? ' with-border' : '') + (selectedId === item.id ? ' selected': '') } onClick={onClickHandler.bind(this,item.id)}>
                    <Sprite className="thumbnailImg" src={(item || {}).image} />
                    <div className="thumbnailCaption">
                        <div className="thumbnailLabel">
                            { getText(item.label) }
                        </div>
                        { showDescription && (
                            <div className="thumbnailDescription">
                                { getText(item.description) }
                            </div>
                        ) }
                    </div>
                </div>
                {finishes && selectedId === item.id ? 
                    <div className="finishList">
                        <MaterialItem materials={finishes} selectedId={selectedFinish} onChange={finish => onFinishSelect(finish)} />
                    </div>
                : null}
            </div>
        );
    }).filter(item => item); // filter null items



    const headerItem = (selectedItem.length < 1) ? '' : selectedItem.map((item,key) => {
        return (
        <div className="thumbnailItemContainer" key={key}>
            <div className={'thumbnailItem header' + (showBorder ? ' with-border' : '') + (thumbnailItems.length < 2 ? ' only-option' : '') + ((selectedId === item.id && !closed) ? ' selected': '')  } onClick={e=> { (thumbnailItems.length > 1) && setClosed(!closed)}} >
                <Sprite className="thumbnailImg" src={(item || {}).image} />
                <div className="thumbnailCaption">
                    <div className="thumbnailLabel">
                        { getText(item.label) }
                    </div>
                    { showDescription && (
                        <div className="thumbnailDescription">
                            { getText(item.description) }
                        </div>
                    ) }
                </div>
            </div>
        </div>
    )})

    if(expandable) { 
        return (
            <div className="ThumbnailList">
                { closed && headerItem.length > 0 ? headerItem : thumbnailItems }
                { headerItem.length > 0 && thumbnailItems.length > 1 &&
                    <div className={"listToggle" + (closed ? ' opened' : ' closedList')} onClick={e=> setClosed(!closed)}>
                        {closed ? getText("ui-signalization-expand-list") : getText("ui-signalization-collapse-list")}
                        <div className={"arrowIcon" + (closed ? ' opened' : ' closedIcon')}/>
                    </div>
                }
            </div>
        )
    } else { 
        return (
            <div className="ThumbnailList">
                {thumbnailItems}
            </div>
        );
    }
}

export default ThumbnailList;
