import "./FileInput.scss"

import React, { useRef, useState } from 'react';
import Icon from "../Icon";

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const FileInput = ({ 
  icon,
  label,
  description,
  className,
  onChange,
}) => {  

  const inputRef = useRef()
  const [ highlight, setHighlight ] = useState(false)

  /* 
  // Max file size 3MB = (3145728 bytes)
  const checkFileSize = file => {
    if (!file || file.size > 3145728) {
      return false
    }
    return true 
  }
  */

  const uploadFile = file => {
    const imageType = /image.*/;
    if (file.type.match(imageType)) {
      const reader = new FileReader();
      reader.onloadend = e => {
        if (e.target.readyState === FileReader.DONE) {
          onChange(e.target.result)
        }
      }
      reader.readAsDataURL(file);
    }
  }

  return (
    <div 
      className={"FileInput" + (className ? ' ' + className : '') + (highlight ? ' highlight' : '') } 
      onDragEnter={ e => {
        e.preventDefault()
        e.stopPropagation()
        setHighlight(true)
      } }

      onDragOver={ e => {
        e.preventDefault()
        e.stopPropagation()
        setHighlight(true)
      } }

      onDragLeave={ e => {
        e.preventDefault()
        e.stopPropagation()
        setHighlight(false)
      } }

      onDrop={ e => {
        e.preventDefault()
        e.stopPropagation()
        setHighlight(false)
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          uploadFile(e.dataTransfer.files[0])
        }
      } }

      onClick={ e => inputRef.current && inputRef.current.click() }
    >
      { icon && <Icon id={icon}/> }
      <div className="container-text">
        <div className="FileInput-label">{label}</div>
        <div className="FileInput-description">{description}</div>
      </div>
      <input ref={inputRef} className="fileInput"  type="file" accept="image/*" onChange={e => {
        if (!e.target.files || !e.target.files.length) {
          return
        }
        uploadFile(e.target.files[0])
      } } />
    </div>
  )
}
export default FileInput