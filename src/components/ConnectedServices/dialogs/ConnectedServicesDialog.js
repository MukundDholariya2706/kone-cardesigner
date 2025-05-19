import "./ConnectedServicesDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../../store/translation";
import { DataContext } from "../../../store/data";
import Dialog, { DialogHead, DialogBody, DialogFooter } from "../../Dialog";
import GridComponent from "../../GridComponent";
import Button from "../../Button";

import imgMonitoring from "../../../assets/images/24-7-monitoring.png";
import imgReporting from "../../../assets/images/24-7-reporting.png";
import imgAlerts from "../../../assets/images/24-7-alerts.png";
import imgAnalysis from "../../../assets/images/24-7-analysis.png";

import imgFallBack from '../../../assets/images/fallback-connected.png'
import { useServiceReadMoreURL } from '../../../utils/customHooks/productHooks';
import { KCSM_24_7_CONNECT } from '../../../constants';

const AirPurifierDialog = ({ onCancel, onConfirm, }) => {
  const { getText } = useContext(TranslationContext);
  const { domainCountry } = useContext(DataContext);

  const videoUrl = 'https://www.youtube.com/embed/gXmNReJSqeY'
  const readMoreUrl = useServiceReadMoreURL(KCSM_24_7_CONNECT)

  return (
    <Dialog className="ConnectedServicesDialog">
      <DialogHead onClose={(e) => onCancel && onCancel(e)}>
        {getText('ui-24-7-connected-services-complete-term')}
      </DialogHead>
      <DialogBody>
        <div className="video-container">
          { domainCountry.youtubeDisabled
            ?(
              <img src={imgFallBack} className="fallbackImage" alt="24/7 Connected Services" />
            )
            :(
              <iframe className="video-element" src={videoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            )
          }
        </div>
        {/* <video className="video-element" src={'youtu.be/O4caPcrs4-Q'} poster={'url-to-poster'} controls/> */}
        <div className="info-heading">{getText('ui-24-7-connected-services-info-content')}</div>
        <GridComponent cols="2" gap="sm" className="grid-20-80">
          <img src={imgMonitoring} className="listImage" />
          <div>
            <p className="list-label">
              {getText('ui-24-7-connected-services-monitoring')}
            </p>
            <div className="info-desc">{getText('ui-24-7-connected-services-monitoring-info')}</div>
          </div>
        </GridComponent>
        <GridComponent cols="2" gap="sm" className="grid-20-80">
          <img src={imgAnalysis} className="listImage" />
          <div>
            <p className="list-label">
              {getText('ui-24-7-connected-services-analysis')}
            </p>
            <div className="info-desc">{getText('ui-24-7-connected-services-analysis-info')}</div>
          </div>
        </GridComponent>
        <GridComponent cols="2" gap="sm" className="grid-20-80">
          <img src={imgAlerts} className="listImage" />
          <div>
            <p className="list-label">
              {getText('ui-24-7-connected-services-alerts')}
            </p>
            <div className="info-desc">{getText('ui-24-7-connected-services-alerts-info')}</div>
          </div>
        </GridComponent>
        <GridComponent cols="2" gap="sm" className="grid-20-80">
          <img src={imgReporting} className="listImage" />
          <div>
            <p className="list-label">
              {getText('ui-24-7-connected-services-reporting')}
            </p>
            <div className="info-desc">{getText('ui-24-7-connected-services-reporting-info')}</div>
          </div>
        </GridComponent>
        {
          readMoreUrl &&
          <div className="info-read-more">
            <a href={readMoreUrl} target="_blank">
              {getText('ui-general-read-more-kone-website')}
            </a>
          </div>
        }
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
