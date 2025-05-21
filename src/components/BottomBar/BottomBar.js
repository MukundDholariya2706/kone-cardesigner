import "./BottomBar.scss";

import React, { useContext, useState } from "react";
import Popover from "react-tiny-popover";

import { TranslationContext } from "../../store/translation/TranslationProvider";
import { Context3d } from "../../store/3d/shader-lib/Provider3d";
import { DesignContext } from "../../store/design/DesignProvider";
import Button from "../Button";
import Icon from "../Icon";
import ListComponent from "../ListComponent";
import HeadingComponent from "../HeadingComponent";
import {
  QUALITY_3D_HIGH,
  QUALITY_3D_LOW,
  QUALITY_3D_MEDIUM,
} from "../../store/3d";
import { useHistory } from "react-router-dom";
import { getLink } from "../../utils/link-utils";
import {
  setAnalyticsForEvent,
  formatDesignForAnalytics,
} from "../../utils/analytics-utils";
import { UserContext } from "../../store/user/UserProvider";
import { BlueprintContext } from '../../store/blueprint';
import { ToastContext } from '../../store/toast/ToastProvider';
import DownloadDialog from "../DownloadDialog";

/**
 * Bottom bar component for editor
 * @param {Object} props Properties passed to this renderer
 */
const BottomBar = (props) => {
  const { isGendocMode } = props
  const { getText } = useContext(TranslationContext);

  const { quality, setQuality } = useContext(Context3d);
  const { renderDesignImages } = useContext(BlueprintContext);
  const { edited, design, designImages } = useContext(DesignContext);
  const { addToast } = useContext(ToastContext)
  const { language } = useContext(UserContext)
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [ showDownloadDialog, setShowDownloadDialog ] = useState(false)
  const history = useHistory()

  const setRenderQuality = (value) => {
    setPopoverOpen(false);
    setQuality(value);
  };

  const setAnalyticsHandler = (e) => {
    if (!design) return;
    const analyticFormattedDesign = formatDesignForAnalytics(design);
    setAnalyticsForEvent({
      eventName: "Download Design",
      eventData: analyticFormattedDesign,
    });
  };

  function renderDownloadLink() {

    const onClick = async (e) => {
      setAnalyticsHandler(e)

      /* 
        - Edited designs should always have images generated
        - If design has not been edited, saved nor shared --> predesign. Need images generated
        - Saved / shared designs either already have images, or they are KTOC designs in which case images are not
          generated unless the design has been edited. (KTOC users can manually generate images from the design specification page if they need to.) If images were to be generated here automatically,
          they would not be stored to the database with the design...
      */
      if (edited || (!design.saved && !design.shared)) {
        props.setRenderingImages(true)
        try {
          await renderDesignImages()          
        } catch (err) {
          console.error(err)
          addToast({
            type: 'warning',
            message: getText('Error occurred when generating images*')
          })
        }
      }

      history.push(getLink(design, edited))
    }
    
    return (
      <div
        className="btn-download-design"
        onClick={onClick}
      >
        <div className="btn-left">
          <Icon id="icon-download" />
        </div>
        <div className="btn-center">
          {getText("ui-general-download-design")}
        </div>
        <div className="btn-right" />
      </div>
    )
  }

  function renderPDFDownloadButton() {
    if (!designImages?.length) return null
    
    return (
      <div
        className="btn-download-design pdf-button"
        onClick={(e) => setShowDownloadDialog(true)}
      >
        <div className="btn-left">
          <Icon id="icon-download" />
        </div>
        <div className="btn-center">
          {getText('ui-download-pdf')}
        </div>
        <div className="btn-right" />
      </div>
    )
  }

  return (
    <>
    <div className="BottomBar">
      <div className="bar-left" />
      <div className="bar-center">
        { isGendocMode ?
          renderPDFDownloadButton() : 
          renderDownloadLink()
        }
      </div>
      <div className="bar-right">
        <Popover
          isOpen={isPopoverOpen}
          position={"top"} // if you'd like, supply an array of preferred positions ordered by priority
          padding={6} // adjust padding here!
          transitionDuration={0}
          onClickOutside={() => setPopoverOpen(false)} // handle click events outside of the popover/target here!
          content={(
            { position, nudgedLeft, nudgedTop, targetRect, popoverRect } // you can also provide a render function that injects some useful stuff!
          ) => (
            <div className="settings-menu">
              <ListComponent gap="sm">
                <HeadingComponent
                  heading={getText("ui-3d-quality")}
                  align="center"
                  style={{ marginBottom: "5px" }}
                />
                <Button
                  selected={quality === QUALITY_3D_HIGH}
                  theme={["white-blue", "rounded-full", "center", "md"]}
                  onClick={(e) => setRenderQuality(QUALITY_3D_HIGH)}
                >
                  {getText("ui-3d-high")}
                </Button>
                <Button
                  selected={quality === QUALITY_3D_MEDIUM}
                  theme={["white-blue", "rounded-full", "center", "md"]}
                  onClick={(e) => setRenderQuality(QUALITY_3D_MEDIUM)}
                >
                  {getText("ui-3d-medium")}
                </Button>
                <Button
                  selected={quality === QUALITY_3D_LOW}
                  theme={["white-blue", "rounded-full", "center", "md"]}
                  onClick={(e) => setRenderQuality(QUALITY_3D_LOW)}
                >
                  {getText("ui-3d-low")}
                </Button>
              </ListComponent>
            </div>
          )}
        >
          <div
            className="btn-settings"
            onClick={() => setPopoverOpen(!isPopoverOpen)}
          >
            <Icon id="icon-settings" />
            <div className="label">{getText("ui-3d-quality")}</div>
          </div>
        </Popover>
      </div>
    </div>
    { showDownloadDialog ? 
    <DownloadDialog
      closed={!showDownloadDialog} 
      onChange={e => setShowDownloadDialog(e)}
      documentLanguage={language}
    /> 
    : null}
    </>
  );
};
export default BottomBar;
