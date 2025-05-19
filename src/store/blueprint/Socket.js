export default class Socket {
  constructor({ id, position, rotation, parentPosition, parentRotation, componentType, component, hideGroup }) {
    this.id = id
    this.position = position
    this.rotation = rotation
    this.parentPosition = parentPosition
    this.parentRotation = parentRotation
    this.componentType = componentType
    this.component = component
    this.hideGroup = hideGroup
  }

  /**
   * returns world position in array format ([x,y,z])
   */
  getWorldPosition() {
    let x = 0
    let y = 0
    let z = 0

    if (this.parentPosition && this.parentPosition.length === 3) {
      x += this.parentPosition[0]
      y += this.parentPosition[1]
      z += this.parentPosition[2]
    }

    if (this.position && this.position.length === 3) {
      if (this.parentRotation && this.parentRotation.length === 3) {
        // NOTE: Following calculation calculates only y-axis rotation
        x += this.position[0] * Math.cos(this.parentRotation[1]) - this.position[2] * Math.sin(this.parentRotation[1])
        y += this.position[1]
        z += this.position[0] * -Math.sin(this.parentRotation[1]) + this.position[2] * Math.cos(this.parentRotation[1])
      } else {
        x += this.position[0]
        y += this.position[1]
        z += this.position[2]
      }
    }

    return [x, y, z]
  }

  /**
   * returns world rotation in array format ([x,y,z])
   */
  getWorldRotation() {
    let x = 0
    let y = 0
    let z = 0

    if (this.parentRotation && this.parentRotation.length === 3) {
      x += this.parentRotation[0]
      y += this.parentRotation[1]
      z += this.parentRotation[2]
    }

    if (this.rotation && this.rotation.length === 3) {
      x += this.rotation[0]
      y += this.rotation[1]
      z += this.rotation[2]
    }
    return [x, y, z]
  }
}