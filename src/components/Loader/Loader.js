import './Loader.scss'
import React, {useContext} from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import logo from '../../assets/icons/react.svg'

const Loader = ({ progress = 0}) => {
    const { getText } = useContext(TranslationContext)
    return (
        <div className="Loader">
            <div className="loader-container">

                <div className="loadBar">
                    <div className="progress" style={{width: `${progress}%`}}></div>
                </div>
                <p>{getText("ui-general-loading-please-wait")}</p>
            </div>
            <div className="loader-bottom-container">
                <img src={logo} alt="KONE Dedicated to People Flow"/>
            </div>
        </div>
    )
}

export default Loader