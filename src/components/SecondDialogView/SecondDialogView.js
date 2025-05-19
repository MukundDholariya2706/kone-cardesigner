import './SecondDialogView.scss'
import React, { useContext } from 'react'
import { Link } from "react-router-dom";
import { LayoutContext } from '../../store/layout';
import { TranslationContext } from '../../store/translation';
import Icon from '../Icon';
import Dialog, { DialogHead, DialogBody, DialogFooter } from '../Dialog';


const SecondDialogView = ({onChange, succesfullySentView=false, contact, redirectOnClose }) => {
    const { getText } = useContext(TranslationContext);
    const layout = useContext(LayoutContext)

    const closeDialog = (e) => onChange(false)

    return (
        <Dialog className="SecondDialogView">
            <DialogHead onClose={e => closeDialog(e)}>
                <div />
            </DialogHead>
            <DialogBody className="secondView">
                {!succesfullySentView ? 
                    <>
                        <div className="thankYouText">
                            {getText('ui-general-thank-you')}
                        </div>
                        <Link to='/edit' >
                            <div className="newCarDesign">
                                <div>
                                    <p>{getText('ui-general-create-new-design')}</p>
                                    <div className="arrow">
                                        <Icon id="icon-arrow-right" /> 
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </>
                    :
                    <div className="success">
                        <p className="sent">
                            { contact ? getText('ui-general-contact-request-succesful') : getText('ui-general-succesfully-sent') }
                        </p>
                        <Icon id="icon-success" />
                    </div>
                }        
            </DialogBody>
            <DialogFooter className="buttonsContainer">
                {redirectOnClose ?
                    <Link className="close" to={layout.previousPage}>{getText('ui-general-close')}</Link> :
                    <button className="close" onClick={e => closeDialog(e)}>{getText('ui-general-close')}</button>}
            </DialogFooter>
        </Dialog>
    )

}

export default SecondDialogView