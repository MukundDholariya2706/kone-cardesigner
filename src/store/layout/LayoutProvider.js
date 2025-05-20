import React, { useState, useEffect, useContext } from 'react';
import { Context3d } from '../3d/shader-lib/Provider3d'
import { VIEW3D_MODE_CAR, EDIT_VIEW_SIGNALIZATION, EDIT_VIEW_DOORS, EDIT_VIEW_MODEL, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, EDIT_VIEW_CUSTOM_WALL_FINISH,
  EDIT_VIEW_CUSTOM_FLOOR_FINISH, EDIT_VIEW_LANDING_FINISHES, THREE_PANELS } from '../../constants'
import { DesignContext } from '../design';

export const LayoutContext = React.createContext();

/**
 * Creates layout store
 * @function LayoutProvider Design store
 * @param {Object} props Properties passed to the provider
 */
export const LayoutProvider = ({children}) => {

  const { sceneManager } = useContext(Context3d)
  const { design } = useContext(DesignContext)

  const [editView, setEditView] = useState(EDIT_VIEW_MODEL)
  const [wasEditing, setWasEditing] = useState()
  const [selectedWall, setSelectedWall] = useState()
  const [selectedPanelB, setSelectedPanelB] = useState()
  const [selectedPanelC, setSelectedPanelC] = useState()
  const [selectedPanelD, setSelectedPanelD] = useState()
  const [editPanelOpen, _setEditPanelOpen] = useState(true);
  const [view3dMode, setView3dMode] = useState(VIEW3D_MODE_CAR);

  const [showDialogDigitalServices, setShowDigitalServices] = useState(true)
  const [showDialogConnectedServices, setShowDialogConnectedServices] = useState(true)
  const [showDialogElevatorMusic, setShowDialogElevatorMusic] = useState(true)
  const [showDialogElevatorCall, setShowDialogElevatorCall] = useState(true)
  const [showDialogRobotApi, setShowDialogRobotApi] = useState(true)
  const [showDialogKoneInformation, setShowDialogKoneInformation] = useState(true)
  const [showDialogAirPurifier, setShowDialogAirPurifier] = useState(true)
  const landingViewEnabled = [
    EDIT_VIEW_SIGNALIZATION,
    EDIT_VIEW_DOORS
  ]

  useEffect(() => {
    if (sceneManager && design) {
      sceneManager.setCameraView(view3dMode, design.carShape, true)
    }
  }, [view3dMode])

  useEffect(() => {
    // For some reason the default state of the camera rotation is incorrect when
    // coming to the editor page from the design specification page...
    // So when mounting, set the default position correctly.
    sceneManager.setCameraView('car', undefined, false)
  }, [])


  function setEditPanelOpen(val) {
    if (!val && ( 
        editView === EDIT_VIEW_CUSTOM_WALL_FINISH ||
        editView === EDIT_VIEW_CUSTOM_FLOOR_FINISH ||
        editView === EDIT_VIEW_LANDING_FINISHES
      )) {
        // These views should not be closeable as they cannot be reopened anymore
        // TODO refactor if more views like this
        return
      }
    _setEditPanelOpen(val)
  }

  function setSelectedPanel(id) {
    switch (selectedWall) {
      case TYP_CAR_WALL_B:
        setSelectedPanelB(id)
        break
      case TYP_CAR_WALL_C:
        setSelectedPanelC(id)
        break
      case TYP_CAR_WALL_D:
        setSelectedPanelD(id)
        break
      default:
        break
    } 
  }

  function getSelectedPanel() {
    switch (selectedWall) {
      case TYP_CAR_WALL_B:
        return selectedPanelB
      case TYP_CAR_WALL_C:
        return selectedPanelC
      case TYP_CAR_WALL_D:
        return selectedPanelD
      default:
        return undefined
    } 
  }

  function setCornerPiecesExeption() {
    setSelectedPanelB(null)
    setSelectedPanelC(THREE_PANELS)
    setSelectedPanelD(null)
  }

  return (
    <LayoutContext.Provider value={{
      editView, setEditView,
      wasEditing,setWasEditing,
      selectedWall, setSelectedWall,
      editPanelOpen, setEditPanelOpen,
      view3dMode, setView3dMode,
      getSelectedPanel, setSelectedPanel, setCornerPiecesExeption,
      showDialogDigitalServices, setShowDigitalServices,
      showDialogConnectedServices, setShowDialogConnectedServices,
      showDialogElevatorMusic, setShowDialogElevatorMusic,
      showDialogElevatorCall, setShowDialogElevatorCall,
      showDialogRobotApi, setShowDialogRobotApi,
      showDialogKoneInformation, setShowDialogKoneInformation,
      showDialogAirPurifier, setShowDialogAirPurifier,
      landingViewEnabled,
    }}>
      {children}
    </LayoutContext.Provider>
  )
}
export default LayoutProvider;

export const LayoutConsumer = LayoutContext.Consumer;
