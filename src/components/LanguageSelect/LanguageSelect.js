import React, { useState, useRef, useContext } from 'react'
import './LanguageSelect.scss'

import { UserContext } from '../../store/user/UserProvider';
import { DataContext } from '../../store/data/DataProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Icon from '../Icon';
import { sortLanguages } from '../../utils/generalUtils';
import { useOnClickOutside } from '../../utils/customHooks'

const LanguageSelect = ({className = ''}) => {
  
  const { languages } = useContext(DataContext)
  const {
    language,
    setLanguage,
  } = useContext(UserContext);

  const { getText } = useContext(TranslationContext)

  const [isClosed, setIsClosed] = useState(true)

  const outerDiv = useRef()
  useOnClickOutside(outerDiv, () => setIsClosed(true))

  const handleLanguageSelection = (item) => {
    setLanguage(item)
  }

  const getLanguageListItems = (items) => {
    if (!items || items.length === 0 || !language) return null
    return sortLanguages(items, getText).map(item => {
      return (<li
        className={`LanguageSelect__option ${
          item.code === language.code ? 'LanguageSelect__option--selected' : ''
          }`}
        onClick={() => handleLanguageSelection(item)}
        data-value={item.code}
        key={item.code}>{getText(`lang-${item.code}`)}</li>)
    })
  }

  const parseLanguageName = ({ code }) => {
    const langName = getText(`lang-${code}`)
    const i = langName.indexOf('(')
    if (i < 0) { // Does not contain parenthesis --> No need to remove anything
      return langName
    }
    return langName.substring(0, i - 1)
  }
  
  return (
    <div 
      className={`LanguageSelect ${className} ${isClosed ? 'LanguageSelect--closed' : '' }`}
      onClick={() => setIsClosed(!isClosed)}
      ref={outerDiv}
    >
      <div className="LanguageSelect__label"><span>{ parseLanguageName(language || {}) }</span></div>
      <i className="LanguageSelect__icon-chevron"><Icon style={{fill: '#0071b9'}} id="icon-chevron-down" /></i>      
      <div className="LanguageSelect__list-container">
        <ul className="LanguageSelect__list">
          { languages &&
            <>
              { getLanguageListItems(languages.primary) }
              <li className="LanguageSelect__subtitle"></li>
              { getLanguageListItems(languages.rest)}
            </>
          }
        </ul>
      </div>
    </div>
  )
}

export default LanguageSelect