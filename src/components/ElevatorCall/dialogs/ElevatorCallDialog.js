import "./ElevatorCallDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../../store/translation/TranslationProvider";import { DataContext } from "../../../store/data/DataProvider";
import Dialog, { DialogHead, DialogBody, DialogFooter } from "../../Dialog";
import Button from "../../Button";

import imgFallBack from '../../../assets/images/fallback-elevator-call.png'
import { useServiceReadMoreURL } from '../../../utils/customHooks/productHooks';
import { KCSM_MOBILE_ELEV_CALL } from '../../../constants';

const ElevatorCallDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);
  const { domainCountry } = useContext(DataContext);

  const videoUrl = 'https://www.youtube.com/embed/8vWhJurISVM'
  const readMoreUrl = useServiceReadMoreURL(KCSM_MOBILE_ELEV_CALL)

  return (
    <Dialog className="ElevatorCallDialog">
      <DialogHead onClose={(e) => onCancel && onCancel(e)}>
        {getText('ui-elevator-call-heading')}
      </DialogHead>
      <DialogBody>
        <div className="video-container">
        { domainCountry.youtubeDisabled
            ?(
              <img src={imgFallBack} className="fallbackImage" alt="Elevator Call " />
            )
            :(
              <iframe className="video-element" src={videoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            )
          }
        </div>
        {/* <video className="video-element" src={'youtu.be/O4caPcrs4-Q'} poster={'url-to-poster'} controls/> */}
        <div className="info-desc">{getText('ui-elevator-call-info-content-para-1')}</div>
        <div className="info-desc">
          {getText('ui-elevator-call-info-content-para-2')}        
          <ul>
            <li>{getText('ui-elevator-call-fact-1')}</li>
            <li>{getText('ui-elevator-call-fact-2')}</li>
            <li>{getText('ui-elevator-call-fact-3')}</li>
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

export default ElevatorCallDialog;
