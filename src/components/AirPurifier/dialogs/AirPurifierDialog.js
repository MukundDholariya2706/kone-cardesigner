import "./AirPurifierDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../../store/translation/TranslationProvider";
import { DataContext } from "../../../store/data/DataProvider";
import Dialog, { DialogHead, DialogBody, DialogFooter } from "../../Dialog";
import Button from "../../Button";

import imgFallBack from '../../../assets/images/fallback-air-purifier.png'
import { useServiceReadMoreURL } from '../../../utils/customHooks/productHooks';
import { KCSM_AIR_PURIFIER } from '../../../constants';

const AirPurifierDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);
  const { domainCountry } = useContext(DataContext);

  const videoUrl = 'https://www.youtube.com/embed/O4caPcrs4-Q'
  const readMoreUrl = useServiceReadMoreURL(KCSM_AIR_PURIFIER)

  return (
    <Dialog className="AirPurifierDialog">
      <DialogHead onClose={(e) => onCancel && onCancel(e)}>
        {getText('ui-air-purifier-heading')}
      </DialogHead>
      <DialogBody>
        <div className="video-container">
          { domainCountry.youtubeDisabled
            ?(
              <img src={imgFallBack} className="fallbackImage" alt="Air Purifier" />
            )
            :(
              <iframe className="video-element" src={videoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            )
          }
        </div>
        <div className="info-heading">{getText('ui-air-purifier-info-heading')}</div>
        <div className="info-desc">{getText('ui-dialog-air-purifier-para-1')}</div>
        <div className="info-desc">{getText('ui-air-purifier-info-content')}</div>
        <div className="info-desc">
          <p className="list-label">
            {getText('ui-dialog-air-purifier-key-benefits')}
          </p>
          <ul>
            <li>{getText('ui-dialog-air-purifier-key-benefit-1')}</li>
            <li>{getText('ui-dialog-air-purifier-key-benefit-2')}</li>
            <li>{getText('ui-dialog-air-purifier-key-benefit-3')}</li>
            <li>{getText('ui-dialog-air-purifier-key-benefit-4')}</li>
          </ul>
        </div>
        { readMoreUrl && <div className="info-read-more">
          <a href={readMoreUrl} target="_blank">
            {getText('ui-general-read-more-kone-website')}
          </a>
        </div>}
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

export default AirPurifierDialog;
