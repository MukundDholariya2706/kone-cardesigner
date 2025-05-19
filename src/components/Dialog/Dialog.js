import "./Dialog.scss"

import React from 'react';
import ReactDOM from 'react-dom';
import Icon from '../Icon';
import ScrollBox from '../ScrollBox'

const CLASS_NAME_MODAL_OPEN = 'modal-open'

// Note: Element <div id="root" /> has to dedined in document (index.html)
function getRoot() {
  return document.getElementById('root');
}

// Note: Element <div id="modal-root" /> has to dedined in document (index.html)
function getModalRoot() {
  return document.getElementById('modal-root');
}

/**
 * Dialog UI component
 */
export default class Dialog extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  // The portal element is inserted in the DOM tree after
  // the Modal's children are mounted, meaning that children
  // will be mounted on a detached DOM node. If a child
  // component requires to be attached to the DOM tree
  // immediately when mounted, for example to measure a
  // DOM node, or uses 'autoFocus' in a descendant, add
  // state to Modal and only render the children when Modal
  // is inserted in the DOM tree.
  componentDidMount() {
    const root = getRoot()
    const modalRoot = getModalRoot()

    modalRoot && modalRoot.appendChild(this.el);
    if (root && root.classList && !root.classList.contains(CLASS_NAME_MODAL_OPEN)) {
      root.classList.add(CLASS_NAME_MODAL_OPEN);
    }
  }

  componentWillUnmount() {
    const root = getRoot()
    const modalRoot = getModalRoot()

    modalRoot && modalRoot.removeChild(this.el);
    if (root && root.classList && root.classList.contains(CLASS_NAME_MODAL_OPEN)) {
      root.classList.remove(CLASS_NAME_MODAL_OPEN);
    }
  }

  render() {
    return ReactDOM.createPortal(
      (
        <div className={"Dialog" + (this.props.padding ? ' padding-' + this.props.padding : '') + (this.props.className ? ' ' + this.props.className : '') } >
          { React.Children.toArray(this.props.children).filter(item => (item.type === DialogHead || item.type === DialogBody || item.type === DialogFooter || item.type === DialogNotification)).map((item, key) => {
            return React.cloneElement(item, { key  })
          }) }
        </div>
      ),
      this.el,
    )
  }
}

export const DialogHead = ({
  children,
  padding,
  className,
  onClose,
}) => {
  return (
    <div className={"DialogHead" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') } >
      { children }
      { onClose && (
        <div className="DialogHead-close" onClick={ e => onClose && onClose() }>
          <Icon id="icon-close" />
        </div>
      ) }
    </div>
  )
}

export const DialogBody = ({
  children,
  padding,
  className,
}) => {
  return (
    <ScrollBox className={"DialogBody" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') } >
      { children }    
    </ScrollBox>
  )
}

export const DialogFooter = ({
  children,
  padding,
  className,
}) => {
  return (
    <div className={"DialogFooter" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') } >
      { children }
    </div>
  )
}

export const DialogNotification = ({
  children,
  padding,
  className,
}) => {
  return (
    <div className={"DialogNotification" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') } >
      { children }
    </div>
  )
}