import "./DcsDialog.scss";
import React, { useContext } from "react";
import { TranslationContext } from "../../store/translation";
import Dialog, { DialogHead, DialogBody, DialogFooter } from "../Dialog";
import Button from "../Button";

// 1x & 2x guide images
import imgSelect from "../../assets/images/dcs-1-select.png";
import imgSelect2x from "../../assets/images/dcs-1-select@2x.png";
import imgMove from "../../assets/images/dcs-2-move.png";
import imgMove2x from "../../assets/images/dcs-2-move@2x.png";
import imgEnjoy from "../../assets/images/dcs-3-enjoy.png";
import imgEnjoy2x from "../../assets/images/dcs-3-enjoy@2x.png";

const quideImages1x = [imgSelect, imgMove, imgEnjoy];
const quideImages2x = [imgSelect2x, imgMove2x, imgEnjoy2x];

const DcsDialog = ({ onCancel, onConfirm }) => {
  const { getText } = useContext(TranslationContext);

  return (
    <Dialog className="DcsDialog">
      <DialogHead onClose={(e) => onCancel && onCancel(e)}>
        {getText("ui-dcs-info-heading")}
      </DialogHead>
      <DialogBody>
        <div className="info-desc">{getText("ui-dcs-info-desc")}</div>
        <div className="quide-items">
          {quideImages1x.map((item, index) => {
            return (
              <div key={index} className="quide-item">
                <div className="v-container">
                  <div className="h-container quide-heading">
                    <div className="quide-number">{index + 1}</div>
                    <div className="v-container">
                      <div className="quide-heading-1">
                        {getText(`ui-dcs-info-q${index + 1}-h1`)}
                      </div>
                      <div className="quide-heading-2">
                        {getText(`ui-dcs-info-q${index + 1}-h2`)}
                      </div>
                    </div>
                  </div>
                  <img
                    className="quide-img"
                    src={item}
                    srcSet={`${quideImages2x[index]} 2x, ${item} 1x`}
                    alt=""
                  />
                  <div className="quide-desc">
                    {getText(`ui-dcs-info-q${index + 1}-desc`)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Disabled for now, possibly will be dynamic later
         <a
          className="info-read-more"
          href="https://www.kone.us/new-buildings/advanced-people-flow-solutions/elevator-destination-control"
          target="_blank"
          rel="noreferrer"
        >
          {getText("ui-general-read-more")}
        </a> */}
      </DialogBody>
      <DialogFooter className="footer-buttons">
        <Button
          className="btn-cancel"
          inlineBlock={true}
          theme={["sm", "outline", "center", "uppercase"]}
          onClick={(e) => onConfirm && onConfirm(e)}
        >
          {getText("ui-general-ok-long")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DcsDialog;
