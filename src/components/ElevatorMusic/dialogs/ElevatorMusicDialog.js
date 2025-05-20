import "./ElevatorMusicDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../../store/translation/TranslationProvider";import { DataContext } from "../../../store/data/DataProvider";
import Dialog, { DialogHead, DialogBody, DialogFooter } from "../../Dialog";
import Button from "../../Button";

import imgFallBack from '../../../assets/images/fallback-elevator-music.png'
import imgKoneLogo from "../../../assets/images/logo.png";
import imgSoundtrackLogo from "../../../assets/images/soundtrack_logo.png";
import { useServiceReadMoreURL } from '../../../utils/customHooks/productHooks';
import { KCSM_ELEV_MUSIC } from '../../../constants';

const ElevatorMusicDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);
  const { domainCountry } = useContext(DataContext);

  const videoUrl = 'https://www.youtube.com/embed/OsLizW60txw'
  const readMoreUrl = useServiceReadMoreURL(KCSM_ELEV_MUSIC)

  return (
    <Dialog className="ElevatorMusicDialog">
      <DialogHead onClose={(e) => onCancel && onCancel(e)}>
        {getText('ui-elevator-music-heading')}
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
        {/* <video className="video-element" src={'youtu.be/O4caPcrs4-Q'} poster={'url-to-poster'} controls/> */}
        <div className="info-heading">{getText('ui-elevator-music-info-heading')}</div>
        <div className="info-desc">{getText('ui-dialog-elevator-music-info')}</div>
        <div className="info-desc">
          <p className="list-label">
            {getText('ui-how-does-it-work')}
          </p>
          <ul>
            <li>{getText('ui-elevator-music-fact-1')}</li>
            <li>{getText('ui-elevator-music-fact-2')}</li>
            <li>{getText('ui-elevator-music-fact-3')}</li>
            <li>{getText('ui-elevator-music-fact-4')}</li>
            <li>{getText('ui-elevator-music-fact-5')}</li>
            <li>{getText('ui-elevator-music-fact-6')}</li>
            <li>{getText('ui-elevator-music-fact-7')}</li>
          </ul>
          <div className="read-more-logos">            
            {readMoreUrl && <a href={readMoreUrl} target="_blank">
              {getText('ui-general-read-more-kone-website')}
            </a>}
            <div className="logos">
              <img src={imgKoneLogo} />
              <div className="plus-sign">+</div>
              <img src={imgSoundtrackLogo} />
            </div>
          </div>
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

export default ElevatorMusicDialog;
