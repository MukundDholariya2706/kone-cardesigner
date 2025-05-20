import "./KoneInformationDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../store/translation/TranslationProvider";
import Dialog, { DialogHead, DialogBody, DialogFooter } from "../Dialog";
import Button from "../Button";
import GridComponent from "../GridComponent";
import Icon from "../Icon";

import imgCarouselCop from "../../assets/images/KONE_information_image2.png";
import imgCarouselMediaScreen from "../../assets/images/KONE_information_image3.png";
import { useServiceReadMoreURL } from '../../utils/customHooks/productHooks';
import { KCSM_KONE_INFORMATION } from '../../constants';

const KoneInformationDialog = ({ onCancel, onConfirm, screenType }) => {
  const { getText } = useContext(TranslationContext);

  const readMoreUrl = useServiceReadMoreURL(KCSM_KONE_INFORMATION)

  return (
    <Dialog className="KoneInformationDialog">
      <DialogHead onClose={(e) => onCancel && onCancel(e)}>
        {getText('ui-general-kone-information')}
      </DialogHead>
      <DialogBody>
        {screenType === 'COP' &&
          <img src={imgCarouselCop} className="headerImage" />
        }
        {screenType !== 'COP' &&
          <img src={imgCarouselMediaScreen} className="headerImage" />
        }
        <div className="info-desc">{getText('ui-kone-information-content-para-1')}</div>
        <div className="info-desc">
          {getText('ui-kone-information-content-para-2')}
          <ul>
            <li>{getText('ui-kone-information-fact-1')}</li>
            <li>{getText('ui-kone-information-fact-2')}</li>
            <li>{getText('ui-kone-information-fact-3')}</li>
          </ul>
        </div>
        <div className="info-desc">
          {getText('ui-kone-informatio-content-para-3')}
        </div>
        <GridComponent cols="1" style={{paddingBottom:'20px'}}>
          <div className="gridLine">
            <div className="title heading">{getText('ui-general-features')}</div>
            <div className="value heading">{getText('ui-general-light')}</div>
            <div className="value heading">{getText('ui-general-standard')}</div>
            <div className="value heading">{getText('ui-general-premium')}</div>
          </div>
          
          <div className="gridLine">
            <div className="title">{getText('ui-kone-information-messaging')}</div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
          </div>

          <div className="gridLine">
            <div className="title">{getText('ui-kone-information-graphics')}</div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
          </div>

          <div className="gridLine">
            <div className="title">{getText('ui-kone-information-video')}</div>
            <div className="value"></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
          </div>

          <div className="gridLine">
            <div className="title">{getText('ui-kone-information-rss')}</div>
            <div className="value"></div>
            <div className="value"></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
          </div>

          <div className="gridLine">
            <div className="title">{getText('ui-kone-information-web')}</div>
            <div className="value"></div>
            <div className="value"></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
          </div>

          <div className="gridLine">
            <div className="title">{getText('ui-kone-information-template')}</div>
            <div className="value"></div>
            <div className="value"></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
          </div>

          <div className="gridLine">
            <div className="title">{getText('ui-kone-information-socialmedia')}</div>
            <div className="value"></div>
            <div className="value"></div>
            <div className="value"><Icon id="icon-check-green" className="checkMark" /></div>
          </div>

        </GridComponent>
        <div className="info-desc">
          {readMoreUrl && <a href={readMoreUrl} target="_blank">
            {getText('ui-general-read-more-kone-website')}
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

function arrow(onClickHandler, type = '') {

  return (
    <div onClick={onClickHandler} className={`arrow ${type}-arrow`}>
      <div className="icon-container">
        <Icon style={{fill: '#0071b9'}} id="icon-chevron-down" />
      </div>
    </div>
  )
}

export default KoneInformationDialog;
