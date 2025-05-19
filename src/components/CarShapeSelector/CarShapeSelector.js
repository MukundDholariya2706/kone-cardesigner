import './CarShapeSelector.scss'
import React from 'react'
import CarShape from '../CarShape'

export const TWO_POSITIONS = 'TWO_POSITIONS';
export const FOUR_POSITIONS = 'FOUR_POSITIONS';
export const SIX_POSITIONS = 'SIX_POSITIONS';

const CarShapeSelector = (props) => {
    const { shape, selected, selectableWalls, onChange, theme = 'default', selectedLables, disabled, showLabels=false, selectedItemDisabled=[], type = SIX_POSITIONS, labelLeft, labelRight, cxaxPieceEnabled=false, cxPieceEnabled=false } = props
    
    let combinedSelections=[];
    let combinedDisables=[];
    let labels={}    

    if(selectedLables) {
        labels=selectedLables;
    }
    
    if(selected) {
        selected.forEach((element, index) => {
            if(element) {
                element.forEach(item => {
                    combinedSelections = [...combinedSelections, item];
                    if(!selectedLables) { labels[item]=index+1; }
                })
            }
        })
    }

    if(disabled) {
        disabled.forEach((element) => {
            if(element) {
                element.forEach(item => {
                    combinedDisables = [...combinedDisables, item];
                })
            }
        })
    }
    
    const onChangeSelection = (pos) => {
        if(combinedSelections.indexOf(pos) !== -1 ) {
            return;
        }
        onChange(pos);
    }

    return (
        <div className={`CarShapeSelector theme-${theme}`}>
            <div className="radioButtonsTop" style={ ( (shape!=="through" && shape!=="selectableBackwall") || (combinedDisables.includes('C1') && combinedDisables.includes('CX') && combinedDisables.includes('C2')) ) ? {display: 'none'} : null } >
                {type !== TWO_POSITIONS &&
                    <div className={"radioContainer c1" + (combinedSelections.indexOf('C1') !== -1 ? ' selected' : '') + ( (combinedDisables.includes('C1') && combinedSelections.indexOf('C1') === -1) ? ' disabled' : '') 
                        + (selectedItemDisabled.includes('C1') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('C1')} >    
                            <div className="radioLabel">
                                {showLabels && labels.C1}
                            </div>
                            <div className={"radioButton" + ( (combinedDisables.includes('C1') && combinedSelections.indexOf('C1') === -1) ? ' disabled' : '')}>
                                <div className="innerRim" />
                            </div>
                    </div>
                }

                { (cxaxPieceEnabled || cxPieceEnabled) &&
                    <div className={"radioContainer cx" + (combinedSelections.indexOf('CX') !== -1 ? ' selected' : '') + (combinedDisables.includes('CX') ? ' disabled' : '') 
                    + (selectedItemDisabled.includes('CX') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('CX')} >    
                        <div className={"radioButton" + (combinedDisables.includes('CX') ? ' disabled' : '')}>
                            <div className="innerRim" />
                        </div>
                        <div className="radioLabel">
                            {showLabels && labels.CX}
                        </div>
                    </div>
                }

                {type !== TWO_POSITIONS &&
                    <div className={"radioContainer c2" + (combinedSelections.indexOf('C2') !== -1 ? ' selected' : '') + ( (combinedDisables.includes('C2') && combinedSelections.indexOf('C2') === -1) ? ' disabled' : '') 
                    + (selectedItemDisabled.includes('C2') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('C2')} >    
                        <div className={"radioButton" + ( (combinedDisables.includes('C2') && combinedSelections.indexOf('C2') === -1) ? ' disabled' : '')}>
                            <div className="innerRim" />
                        </div>
                        <div className="radioLabel">
                            {showLabels && labels.C2}
                        </div>
                    </div>
                }
            </div>

            <div className="sidewalls">
                {(selectableWalls || []).includes('D') ?
                <div className="radioButtonsLeft">
                    {type !== TWO_POSITIONS &&
                        <div className={"radioContainer" + (combinedSelections.indexOf('D2') !== -1 ? ' selected' : '') + (combinedDisables.includes('D2') ? ' disabled' : '') 
                        + (selectedItemDisabled.includes('D2') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('D2')} >    
                            <div className="radioLabel">
                                {showLabels && labels.D2}
                            </div>
                            <div className={"radioButton" + (combinedDisables.includes('D2') ? ' disabled' : '')}>
                                <div className="innerRim" />
                            </div>
                        </div>
                    }

                    { (type === SIX_POSITIONS || type === TWO_POSITIONS || (type === FOUR_POSITIONS && (combinedDisables.indexOf('DX') === -1 || combinedDisables.indexOf('BX') === -1) ) ) && (
                        <div className={"radioContainer" + (combinedSelections.indexOf('DX') !== -1 ? ' selected' : '') + (combinedDisables.includes('DX') ? ' disabled' : '')
                        + (selectedItemDisabled.includes('DX') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('DX')}>    
                            <div className="radioLabel">
                                {showLabels && labels.DX}
                            </div>
                            <div className={"radioButton" + (combinedDisables.includes('DX') ? ' disabled' : '')}>
                                <div className="innerRim" />
                            </div>
                        </div>
                    )}


                    {type !== TWO_POSITIONS &&
                        <div className={"radioContainer" + (combinedSelections.indexOf('D1') !== -1 ? ' selected' : '') + (combinedDisables.includes('D1') ? ' disabled' : '')
                        + (selectedItemDisabled.includes('D1') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('D1')}>    
                            <div className="radioLabel">
                                {showLabels && labels.D1}
                            </div>
                            <div className={"radioButton" + (combinedDisables.includes('D1') ? ' disabled' : '')}>
                                <div className="innerRim" />
                            </div>
                        </div>
                    }
                </div> :
                null
                }
                <CarShape selected={combinedSelections} shape={shape} disabled={combinedDisables}
                        selectedItemDisabled={selectedItemDisabled} type={type} cxaxPieceEnabled={cxaxPieceEnabled} cxPieceEnabled={cxPieceEnabled} />

                {(selectableWalls || []).includes('B') &&
                <div className="radioButtonsRight">
                    {type !== TWO_POSITIONS &&
                        <div className={"radioContainer" + (combinedSelections.indexOf('B1') !== -1 ? ' selected' : '') + (combinedDisables.includes('B1') ? ' disabled' : '')
                        + (selectedItemDisabled.includes('B1') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('B1')}>    
                            <div className={"radioButton" + (combinedDisables.includes('B1') ? ' disabled' : '')}>
                                <div className="innerRim" />
                            </div>
                            { (labels.B1) &&
                                <div className="radioLabel">
                                    {showLabels && labels.B1}
                                </div>
                            }
                        </div>
                    }
                    { (type === SIX_POSITIONS || type === TWO_POSITIONS || (type === FOUR_POSITIONS && (combinedDisables.indexOf('DX') === -1 || combinedDisables.indexOf('BX') === -1) ) ) && (
                        <div className={"radioContainer" + (combinedSelections.indexOf('BX') !== -1 ? ' selected' : '') + (combinedDisables.includes('BX') ? ' disabled' : '')
                        + (selectedItemDisabled.includes('BX') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('BX')}>    
                            <div className={"radioButton" + (combinedDisables.includes('BX') ? ' disabled' : '')}>
                                <div className="innerRim" />
                            </div>
                            <div className="radioLabel">
                                {showLabels && labels.BX}
                            </div>
                        </div>
                    ) }

                    {type !== TWO_POSITIONS &&
                        <div className={"radioContainer" + (combinedSelections.indexOf('B2') !== -1 ? ' selected' : '') + (combinedDisables.includes('B2') ? ' disabled' : '')
                        + (selectedItemDisabled.includes('B2') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('B2')}>    
                            <div className={"radioButton" + (combinedDisables.includes('B2') ? ' disabled' : '')}>
                                <div className="innerRim" />
                            </div>
                            <div className="radioLabel">
                                {showLabels && labels.B2}
                            </div>
                        </div>
                    }
                </div>
            }
            </div>

            {( (selectableWalls || []).includes('A') ) &&
            <div className="radioButtonsTop" style={(combinedDisables.includes('A1') && combinedDisables.includes('AX') && combinedDisables.includes('A2')) ?{display: 'none'} :null}>
                <div className={"radioContainer c1" + (combinedSelections.indexOf('A2') !== -1 ? ' selected' : '') + (combinedDisables.includes('A2') ? ' disabled' : '') 
                    + (selectedItemDisabled.includes('A2') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('A2')} >    
                        <div className="radioLabel">
                            {showLabels && labels.A2}
                        </div>
                        <div className={"radioButton" + (combinedDisables.includes('A2') ? ' disabled' : '')}>
                            <div className="innerRim" />
                        </div>
                </div>

                { cxaxPieceEnabled &&
                    <div className={"radioContainer cx" + (combinedSelections.indexOf('AX') !== -1 ? ' selected' : '') + (combinedDisables.includes('AX') ? ' disabled' : '') 
                    + (selectedItemDisabled.includes('AX') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('AX')} >    
                        <div className={"radioButton" + (combinedDisables.includes('AX') ? ' disabled' : '')}>
                            <div className="innerRim" />
                        </div>
                        <div className="radioLabel">
                            {showLabels && labels.AX}
                        </div>
                    </div>
                }

                <div className={"radioContainer c2" + (combinedSelections.indexOf('A1') !== -1 ? ' selected' : '') + (combinedDisables.includes('A1') ? ' disabled' : '') 
                + (selectedItemDisabled.includes('A1') ? ' selectedItemDisabled' : '')} onClick={e => onChangeSelection('A1')} >    
                    <div className={"radioButton" + (combinedDisables.includes('A1') ? ' disabled' : '')}>
                        <div className="innerRim" />
                    </div>
                    <div className="radioLabel">
                        {showLabels && labels.A1}
                    </div>
                </div>
            </div> 
            }

            <div className="car-shape-selector-labels" >
                <div className="car-shape-selector-label car-shape-selector-label-left" >{labelLeft}</div>
                <div className="car-shape-selector-label car-shape-selector-label-right" >{labelRight}</div>
            </div>

        </div>
    )
}

export default CarShapeSelector