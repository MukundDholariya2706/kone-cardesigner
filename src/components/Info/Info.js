import "./Info.scss";
import React from "react";
import Icon from "../Icon";
import { Tooltip as ReactTooltip } from "react-tooltip";
import objectHash from "object-hash";

const Info = ({
  visible = true,
  text,
  html = false,
  children,
  tooltipPlacement = "top",
  effect = "float",
  dataEvent = "click",
  className = "",
}) => {
  if (!visible || !text || text === "" || text === " ") {
    return null;
  }

  if (html) {
    return (
      <>
        <div
          className="Info"
          data-event="click"
          data-tip
          data-for={objectHash(text)}
        >
          <Icon id="icon-info" />
        </div>
        <ReactTooltip
          className="tooltipwide"
          id={objectHash(text)}
          backgroundColor="#ffffff"
          textColor="#000000"
          place="right"
        >
          {children}
        </ReactTooltip>
      </>
    );
  }

  return (
    <>
      <div
        className={`Info ${className}`}
        data-tip={text}
        data-event={dataEvent}
        data-for={objectHash(text)}
      >
        <Icon id="icon-info" />
      </div>
      <ReactTooltip
        globalEventOff="click"
        className="tooltip"
        effect={effect}
        place={tooltipPlacement}
        id={objectHash(text)}
        backgroundColor="#ffffff"
        textColor="#000000"
      />
    </>
  );
};

export default Info;
