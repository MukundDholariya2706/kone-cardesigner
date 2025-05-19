import './LandingPositions.scss'
import React from 'react'
import Icon from '../Icon'
import { TOP_CENTER, TOP_CENTER_FRAME, TOP_LEFT, TOP_LEFT_FRAME, TOP_RIGHT, TOP_RIGHT_FRAME, MIDDLE_LEFT, MIDDLE_LEFT_FRAME, MIDDLE_RIGHT, MIDDLE_RIGHT_FRAME } from '../../constants';

const LandingPositions = ({ selectedPositions = [], positions = [], onChange }) => {
  return (
      <div className="LandingPositions">
        <div className="background">
          <Icon id="icon-landing-editor" /> 
        </div>

        <div className={"hl-horizontal top" + (selectedPositions.indexOf(TOP_CENTER) !== -1 ? ' selected':'')  + (positions.indexOf(TOP_CENTER) === -1 ? ' disabled':'') } 
          onClick={e => onChange(TOP_CENTER)} > 
          <Icon id="icon-hall-indicator-horizontal" />
        </div>
        <div className={"hl-horizontal bottom" + (selectedPositions.indexOf(TOP_CENTER_FRAME) !== -1 ? ' selected':'') + (positions.indexOf(TOP_CENTER_FRAME) === -1 ? ' disabled':'') }
          onClick={e => onChange(TOP_CENTER_FRAME)} >
          <Icon id="icon-hall-indicator-horizontal" />
        </div>

        <div className={"hl-vertical left outer" + (selectedPositions.indexOf(TOP_LEFT) !== -1 ? ' selected':'') + (positions.indexOf(TOP_LEFT) === -1 ? ' disabled':'')} 
          onClick={e => onChange(TOP_LEFT)} >
          <Icon id="icon-hall-indicator-vertical" />
        </div>
        <div className={"hl-vertical left inner" + (selectedPositions.indexOf(TOP_LEFT_FRAME) !== -1 ? ' selected':'') + (positions.indexOf(TOP_LEFT_FRAME) === -1 ? ' disabled':'')} 
          onClick={e => onChange(TOP_LEFT_FRAME)} >
          <Icon id="icon-hall-indicator-vertical" />          
        </div>
        <div className={"hl-vertical right inner" + (selectedPositions.indexOf(TOP_RIGHT_FRAME) !== -1 ? ' selected':'') + (positions.indexOf(TOP_RIGHT_FRAME) === -1 ? ' disabled':'')} 
          onClick={e => onChange(TOP_RIGHT_FRAME)} >
          <Icon id="icon-hall-indicator-vertical" />          
        </div>
        <div className={"hl-vertical right outer" + (selectedPositions.indexOf(TOP_RIGHT) !== -1 ? ' selected':'') + (positions.indexOf(TOP_RIGHT) === -1 ? ' disabled':'')} 
          onClick={e => onChange(TOP_RIGHT)} >
          <Icon id="icon-hall-indicator-vertical" />
        </div>

        <div className={"lcs left outer" + (selectedPositions.indexOf(MIDDLE_LEFT) !== -1 ? ' selected':'') + (positions.indexOf(MIDDLE_LEFT) === -1 ? ' disabled':'')} 
          onClick={e => onChange(MIDDLE_LEFT)} >
          <Icon id="icon-landing-call" />          
        </div>
        <div className={"lcs left inner" + (selectedPositions.indexOf(MIDDLE_LEFT_FRAME) !== -1 ? ' selected':'') + (positions.indexOf(MIDDLE_LEFT_FRAME) === -1 ? ' disabled':'')} 
          onClick={e => onChange(MIDDLE_LEFT_FRAME)} >
          <Icon id="icon-landing-call" />          
        </div>
        <div className={"lcs right inner" + (selectedPositions.indexOf(MIDDLE_RIGHT_FRAME) !== -1 ? ' selected':'') + (positions.indexOf(MIDDLE_RIGHT_FRAME) === -1 ? ' disabled':'')} 
          onClick={e => onChange(MIDDLE_RIGHT_FRAME)} >
          <Icon id="icon-landing-call" />          
        </div>  
        <div className={"lcs right outer" + (selectedPositions.indexOf(MIDDLE_RIGHT) !== -1 ? ' selected':'') + (positions.indexOf(MIDDLE_RIGHT) === -1 ? ' disabled':'')} 
          onClick={e => onChange(MIDDLE_RIGHT)} >
          <Icon id="icon-landing-call" />          
        </div>
      </div>
  )
}

export default LandingPositions