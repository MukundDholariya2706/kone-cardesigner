import './EditPanel.scss';
import React, { useContext, useState, useRef } from 'react';
import { LayoutContext } from '../../store/layout/LayoutProvider';

import CeilingEditor from '../CeilingEditor';
import WallsEditor from '../WallsEditor';
import FloorEditor from '../FloorEditor';
import ModelAndLayoutEditor from '../ModelAndLayoutEditor';
import DoorsEditor from '../DoorsEditor';
import AccessoriesEditor from '../AccessoriesEditor';
import DigitalServicesEditor from '../DigitalServicesEditor';
import ConnectedServices from '../ConnectedServices';
import ElevatorMusic from '../ElevatorMusic';
import ElevatorCall from '../ElevatorCall';
import RobotApi from '../RobotApi';
import LandingEditor from '../LandingEditor';
import SignalizationEditor from '../SignalizationEditor';
import Handrails from '../Handrails'
import Skirting from '../Skirting'
import Seat from '../Seat';
import TenantDirectory from '../TenantDirectory/TenantDirectory';
import BufferRails from '../BufferRails/BufferRails';
import Mirrors from '../Mirrors/Mirrors';
import InfoMediaScreens from '../InfoMediaScreens/InfoMediaScreens';
import AirPurifier from '../AirPurifier';

import { EDIT_VIEW_ACCESORIES, EDIT_VIEW_CEILING,EDIT_VIEW_DOORS,EDIT_VIEW_FLOOR,
        EDIT_VIEW_HANDRAIL,EDIT_VIEW_MODEL,EDIT_VIEW_WALLS, EDIT_VIEW_SIGNALIZATION, EDIT_VIEW_SKIRTING, EDIT_VIEW_LANDING,
        EDIT_VIEW_LANDING_FINISHES, EDIT_VIEW_SEAT, EDIT_VIEW_TENANT_DIRECTORY, EDIT_VIEW_BUFFER_RAIL, EDIT_VIEW_MIRRORS, EDIT_VIEW_INFO_MEDIA_SCREENS, EDIT_VIEW_CUSTOM_FLOOR_FINISH, EDIT_VIEW_CUSTOM_WALL_FINISH, 
          EDIT_VIEW_AIR_PURIFIER, EDIT_VIEW_CONNECTED_SERVICES, EDIT_VIEW_ELEVATOR_MUSIC, EDIT_VIEW_ELEVATOR_CALL, EDIT_VIEW_ROBOT_API,
        MAT_CAR_FLOORING, MAT_CAR_WALL_FINISH_B, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, MAT_CAR_WALL_FINISH_C, MAT_CAR_WALL_FINISH_D, EDIT_VIEW_FLOOR_FINISH_MIXER,
        TYP_CAR_GLASS_WALL_C, EDIT_VIEW_DIGITAL_SERVICES} from '../../constants'
import CustomFinishEditor from '../CustomFinishEditor';
import FloorFinishMixer from '../FloorFinishMixer/FloorFinishMixer';
import { DesignContext } from '../../store/design/DesignProvider';
import LandingFinishesEditor from '../LandingFinishesEditor';
import { ProductContext } from '../../store/product/ProductProvider';
import Alert from '../Alert/Alert';
import Icon from '../Icon';
import { getFloorMixerGroups } from '../../utils/product-utils'

/**
 * EditPanel is functional React component.
 * It's main purpose is choose between edit views 
 * and render selected view
 * - uses LayoutConsumer as store
 * @function EditPanel Editpanel renderer
 */
const EditPanel = () => {
  
  const layout = useContext(LayoutContext);
  const design = useContext(DesignContext)
  const product = useContext(ProductContext)
  const [ error, setError ] = useState()
  const viewToReturnToRef = useRef(EDIT_VIEW_MODEL)
  let customWallType = null

  if (layout.editView === EDIT_VIEW_CUSTOM_WALL_FINISH) {
    if (layout.selectedWall === TYP_CAR_WALL_B) {
      customWallType = MAT_CAR_WALL_FINISH_B
    }
    if (layout.selectedWall === TYP_CAR_WALL_C || layout.selectedWall === TYP_CAR_GLASS_WALL_C) {
      customWallType = MAT_CAR_WALL_FINISH_C
    }
    if (layout.selectedWall === TYP_CAR_WALL_D) {
      customWallType = MAT_CAR_WALL_FINISH_D
    }
  }

  function setCustomFinish(options) {
    design.setFinish(options)
  }

  function setCustomWallFinish({ type, finish, custom }) {
    design.setWallFinish({
      finishType: type,
      finish,
      panelType: layout.getSelectedPanel(),
      custom
    })
  }

  async function handleCustomWallFinishSave(params, type) {
    const id = await product.saveCustomFinish(params)
    design.setWallFinish({
      finishType: type,
      finish: id,
      panelType: layout.getSelectedPanel(),
      custom: true
    })
  }

  async function handleCustomFinishSave(params, type) {
    const id = await product.saveCustomFinish(params)
    design.setFinish({ type, finish: id, custom: true })
  }
  
  return (
  <div className={'EditPanel' + (!layout.editPanelOpen ? ' closed': '') }>
    {/* <Suspense fallback={<div/>}> */}
    <>
      {layout.editView === EDIT_VIEW_MODEL ? (<ModelAndLayoutEditor />) : null }          
      {layout.editView === EDIT_VIEW_CEILING ? (<CeilingEditor />) : null }          
      {layout.editView === EDIT_VIEW_WALLS ? (<WallsEditor />) : null }          
      {layout.editView === EDIT_VIEW_FLOOR ? (<FloorEditor />) : null }          
      {layout.editView === EDIT_VIEW_DOORS ? (() => {
        viewToReturnToRef.current = EDIT_VIEW_DOORS
        return (<DoorsEditor />)
      })() : null }          
      {layout.editView === EDIT_VIEW_ACCESORIES ? (<AccessoriesEditor />) : null }
      {layout.editView === EDIT_VIEW_SIGNALIZATION ? (() => {
        viewToReturnToRef.current = EDIT_VIEW_SIGNALIZATION
        return (<SignalizationEditor />)
      })() : null }
      {layout.editView === EDIT_VIEW_SKIRTING ? (<Skirting />) : null }          
      {layout.editView === EDIT_VIEW_HANDRAIL ? (<Handrails />) : null }          
      {layout.editView === EDIT_VIEW_MIRRORS ? (<Mirrors />) : null }          
      {layout.editView === EDIT_VIEW_BUFFER_RAIL ? (<BufferRails />) : null }  
      {layout.editView === EDIT_VIEW_TENANT_DIRECTORY ? (<TenantDirectory />) : null }     
      {layout.editView === EDIT_VIEW_INFO_MEDIA_SCREENS ? (<InfoMediaScreens />) : null }     
      {layout.editView === EDIT_VIEW_AIR_PURIFIER ? (<AirPurifier />) : null }     
      {layout.editView === EDIT_VIEW_SEAT ? (<Seat />) : null }          
      {layout.editView === EDIT_VIEW_DIGITAL_SERVICES ? (<DigitalServicesEditor />) : null }
      {layout.editView === EDIT_VIEW_CONNECTED_SERVICES ? (<ConnectedServices />) : null }
      {layout.editView === EDIT_VIEW_ELEVATOR_MUSIC ? (<ElevatorMusic />) : null }
      {layout.editView === EDIT_VIEW_ELEVATOR_CALL ? (<ElevatorCall />) : null }
      {layout.editView === EDIT_VIEW_ROBOT_API ? (<RobotApi />) : null }
      {layout.editView === EDIT_VIEW_LANDING ? (<LandingEditor />) : null }
      {layout.editView === EDIT_VIEW_LANDING_FINISHES ? (
        <LandingFinishesEditor 
          previousView={viewToReturnToRef.current}
          setError={setError}
           />) : null }
      {layout.editView === EDIT_VIEW_CUSTOM_FLOOR_FINISH ? (
        <CustomFinishEditor 
          type={MAT_CAR_FLOORING}
          setFinish={setCustomFinish}
          setError={setError}
          setView={layout.setEditView}
          previousView={EDIT_VIEW_FLOOR}
          onAction={params => handleCustomFinishSave(params, MAT_CAR_FLOORING)}
        />) : null }
      {layout.editView === EDIT_VIEW_CUSTOM_WALL_FINISH ? (
        <CustomFinishEditor 
          type={customWallType} 
          setFinish={setCustomWallFinish}
          setError={setError}
          setView={layout.setEditView}
          previousView={EDIT_VIEW_WALLS}
          checkGlassBackwall={true}
          onAction={params => handleCustomWallFinishSave(params, customWallType)}
        />) : null }
      {layout.editView === EDIT_VIEW_FLOOR_FINISH_MIXER ? (<FloorFinishMixer groups={getFloorMixerGroups(product?.product)} />) : null }
    </>
    <div className="close-button-container">
      <div className="close-button" onClick={ e => layout.setEditPanelOpen(false)} >
        <Icon id="icon-remove-item" />
      </div>
    </div>
    {/* </Suspense> */}
    { error && <Alert title="ui-local-storage-full-title" description="ui-local-storage-full-desc" onOk={ e => setError(null) } onClose={ e => setError(null) } /> }
  </div>
)}

export default EditPanel;
