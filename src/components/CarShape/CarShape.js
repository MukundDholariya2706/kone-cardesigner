import './CarShape.scss'
import React from 'react'
import {
    SIX_POSITIONS,
    TWO_POSITIONS,
    FOUR_POSITIONS 
} from '../CarShapeSelector/CarShapeSelector';

const CarShape = (props) => {
    const { shape, selected, disabled=[], selectedItemDisabled=[], type = SIX_POSITIONS, cxaxPieceEnabled=false, cxPieceEnabled=false  } = props

    const backwallSelectable = ( shape === "selectableBackwall" || (shape==='through' && (disabled.indexOf('C1') === -1 || disabled.indexOf('C2') === -1)))

    const frontwallSelectable = !( (disabled || []).includes('A2') )

    return (
        <div className="CarShape">

            {(shape === 'through' || backwallSelectable) ? 
            <div className="backwall-through" >
                <div className={"throughwall left" + (backwallSelectable? ' backwallSelectable':'') + ((selected || []).includes('C1') ? ' selected' : '')} />
                {(backwallSelectable && shape !== 'through') && <div className="throughwall center" />}
                { ( (shape === 'through' && cxaxPieceEnabled) || ( shape !== 'through' && cxPieceEnabled) ) && 
                    <div className={"throughwall center" + (backwallSelectable? ' backwallSelectable':'') + ((selected || []).includes('CX') ? ' selected' : '')} />
                }
                <div className={"throughwall right" + (backwallSelectable? ' backwallSelectable':'') + ((selected || []).includes('C2') ? ' selected' : '')} />
            </div>
             :
            <div className={"backwall" + ((selected || []).includes(BACKWALL) ? ' selected' : '')} />
            }


            <div className="left">

                { type!==TWO_POSITIONS &&
                    <div className={"position" + ((selected || []).includes('D2') ? ' selected' : '') + ((disabled || []).includes('D2') ? ' disabled' : '') 
                    + (selectedItemDisabled.includes('D2') ? ' selectedItemDisabled' : '')} />
                }

                { (type === SIX_POSITIONS || type===TWO_POSITIONS || (type === FOUR_POSITIONS && (disabled.indexOf('DX') === -1 || disabled.indexOf('BX') === -1) )) && (
                    <div className={"position" + ((selected || []).includes('DX') ? ' selected' : '') + ((disabled || []).includes('DX') ? ' disabled' : '')
                    + (selectedItemDisabled.includes('DX') ? ' selectedItemDisabled' : '')} />
                ) }

                { type!==TWO_POSITIONS &&
                    <div className={"position" + ((selected || []).includes('D1') ? ' selected' : '') + ((disabled || []).includes('D1') ? ' disabled' : '')
                    + (selectedItemDisabled.includes('D1') ? ' selectedItemDisabled' : '')} />
                }

            </div>


            <div className="right">

                { type!==TWO_POSITIONS &&
                    <div className={"position" + ((selected || []).includes('B1') ? ' selected' : '') + ((disabled || []).includes('B1') ? ' disabled' : '')
                    + (selectedItemDisabled.includes('B1') ? ' selectedItemDisabled' : '')} />
                }

                { (type === SIX_POSITIONS || type===TWO_POSITIONS || (type === FOUR_POSITIONS && (disabled.indexOf('DX') === -1 || disabled.indexOf('BX') === -1)) ) && (
                    <div className={"position" + ((selected || []).includes('BX') ? ' selected' : '') + ((disabled || []).includes('BX') ? ' disabled' : '')
                    + (selectedItemDisabled.includes('BX') ? ' selectedItemDisabled' : '')} />
                ) }

                { type!==TWO_POSITIONS &&
                    <div className={"position" + ((selected || []).includes('B2') ? ' selected' : '') + ((disabled || []).includes('B2') ? ' disabled' : '')
                    + (selectedItemDisabled.includes('B2') ? ' selectedItemDisabled' : '')} />
                }

            </div>

            <div className="frontwall">
                <div className={"throughwall left front" + ((selected || []).includes('A2') ? ' selected' : '') + (frontwallSelectable? ' frontwallSelectable':'')} />
                {(cxaxPieceEnabled) && 
                    <div className={"throughwall center" + (frontwallSelectable? ' frontwallSelectable':'') + ((selected || []).includes('AX') ? ' selected' : '')} />
                }
                <div className={"throughwall right front" + ((selected || []).includes('A1') ? ' selected' : '') + (frontwallSelectable? ' frontwallSelectable':'')} />
            </div>

        </div>
    )
}

export default CarShape

export const BACKWALL = 'backwall'