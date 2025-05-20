import "./DigitalServicesDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../../store/translation/TranslationProvider";import Dialog, { DialogBody, DialogFooter } from "../../Dialog";
import Button from "../../Button";
import Icon from "../../Icon";
import GridComponent from "../../GridComponent";
import imgDigitalServices from "../../../assets/images/react.svg";
import { useServiceReadMoreURL } from '../../../utils/customHooks/productHooks';

const DigitalServicesDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);
  const readMoreUrl = useServiceReadMoreURL('SERVICES')
  return (
    <Dialog className="DigitalServicesDialog">
      <DialogBody>
        <div className="heading-image" style={ {backgroundImage:`url(${imgDigitalServices})`} }>
          <div className="heading-image-text-container">
            <div className="info-heading">{getText('ui-dialog-digital-services-info-heading')}</div>
            <div className="info-sub-heading">{getText('ui-dialog-digital-services-info-sub-heading')}</div>
            <div className="info-desc">{getText('ui-dialog-digital-services-info-content')}</div>
          </div>
          <div className="heading-close" onClick={ (e) => onConfirm && onConfirm(e) }>
            <Icon id="icon-close-white" className="close-icon"/>
          </div>
        </div>
        <GridComponent cols="2" gap="sm" className="grid-20-80">
          <Icon id="office" className="list-image"/>
          <div>
            <p className="list-label">
              {getText('ui-dialog-digital-services-improve')}
            </p>
            <div className="info-desc">{getText('ui-dialog-digital-services-improve-info')}</div>
          </div>
        </GridComponent>
        <GridComponent cols="2" gap="sm" className="grid-20-80">
          <Icon id="mobile-comm" className="list-image"/>
          <div>
            <p className="list-label">
              {getText('ui-dialog-digital-services-create')}
            </p>
            <div className="info-desc">{getText('ui-dialog-digital-services-create-info')}</div>
          </div>
        </GridComponent>
        <GridComponent cols="2" gap="sm" className="grid-20-80">
          <Icon id="statistics" className="list-image"/>
          <div>
            <p className="list-label">
              {getText('ui-dialog-digital-services-decisions')}
            </p>
            <div className="info-desc">{getText('ui-dialog-digital-services-decisions-info')}</div>
          </div>
        </GridComponent>
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

export default DigitalServicesDialog;
