import "./RobotApiDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../../store/translation/TranslationProvider";import { DataContext } from "../../../store/data/DataProvider";
import Dialog, { DialogHead, DialogBody, DialogFooter } from "../../Dialog";
import Button from "../../Button";

import imgFallBack from '../../../assets/images/react.svg'
import { useServiceReadMoreURL } from '../../../utils/customHooks/productHooks';
import { KCSM_APF_SERV_ROBOT_API } from '../../../constants';

const RobotApiDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);
  const { domainCountry } = useContext(DataContext);

  const videoUrl = 'https://www.youtube.com/embed/hkDP2u-HY8o'
  const readMoreUrl = useServiceReadMoreURL(KCSM_APF_SERV_ROBOT_API)

  return (
    <Dialog className="RobotApiDialog">
      <DialogHead onClose={(e) => onCancel && onCancel(e)}>
        {getText('ui-robot-api-heading')}
      </DialogHead>
      <DialogBody>
        <div className="video-container">
        { domainCountry.youtubeDisabled
            ?(
              <img src={imgFallBack} className="fallbackImage" alt="Robot API" />
            )
            :(
              <iframe className="video-element" src={videoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            )
          }
        </div>
        <div className="info-desc" style={{marginTop:'20px'}}>{getText('ui-robot-api-info-content-para-1')}</div>
        <div className="info-desc">{getText('ui-robot-api-info-content-para-2')}</div>
        <div className="info-desc">{getText('ui-dialog-robot-api-para-3')}</div>
        <div className="info-desc">
          {getText('ui-dialog-robot-api-features-label')}

          <ul>
            <li>{getText('ui-dialog-robot-api-fact-1')}</li>
            <li>{getText('ui-dialog-robot-api-fact-2')}</li>
            <li>{getText('ui-dialog-robot-api-fact-3')}</li>
            <li>{getText('ui-dialog-robot-api-fact-4')}</li>
          </ul>

          {readMoreUrl && <a href={readMoreUrl} target="_blank">
            {getText('ui-general-read-more-kone-api-portal')}
          </a>}
        </div>
      </DialogBody>
      <DialogFooter className="footer-buttons">
        <Button
          className="btn-cancel"
          inlineBlock={true}
          theme={["sm", "outline", "center", "uppercase"]}
          onClick={(e) => onConfirm && onConfirm(e)}
        >
          {getText("ui-general-close")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default RobotApiDialog;
