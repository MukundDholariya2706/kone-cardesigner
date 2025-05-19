import './SwitchButton.scss'
import React from 'react'

const SwitchButton = ({toggle, label, onChange, isDisabled, className = '', extraStyle={}}) => {
    
    const handleSwitch = () => {
        onChange(!toggle)
    }
    return (
        <div className={`SwitchButton ${className}`}>
            <div className="SwitchButton-label" style={extraStyle}>{label}</div>
            <div className={'switch'+(isDisabled?' disabled':'') + (toggle ? ' on' : '')} onClick={handleSwitch}>
                <div className={"switchButton" + (toggle ? ' on' : '')} />
            </div> 
        </div>
    )
}

export default SwitchButton