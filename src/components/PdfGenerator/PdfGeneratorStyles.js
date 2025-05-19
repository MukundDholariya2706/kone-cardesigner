import styled from '@react-pdf/styled-components';
/* import {Font } from '@react-pdf/renderer'
import font from '../../styles/fonts/KONE_Information.ttf'
import fontZh from '../../styles/fonts/simhei.ttf'

Font.register({
  family: 'KoneFont',
  src: font,
  weight: 'normal'
});

Font.register({
  family: 'DroidSansFallback',
  src: fontZh,
  weight: 'normal'
});

//Font.registerHyphenationCallback(word => word.length === 1 ? [word] : Array.from(word).map(char => char));
Font.registerHyphenationCallback(word => [word]);
 */
/* Font.registerHyphenationCallback((word: string) => {
  if (word.length === 1) {
    return [word];
  }   

  return Array.from(word)
    .map((char) => [char, ''])
    .reduce((arr, current) => {
      arr.push(...current);
      return arr;
    }, []);
});
 */
const padding = '35px';
const paddingBottom = '20px';

export const FullPage = styled.Page`
  background-color: white;
  color: black;
  padding-top: 0;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
`;

export const RegularPage = styled.Page`
  background-color: white;
  color: black;
  height: 100%;
  padding-top: ${padding};
  padding-left: ${padding};
  padding-right: ${padding};
  padding-bottom: ${paddingBottom};
`;

export const PageNumber = styled.Text`
  position: abosolute;
  bottom: 8;
  left: 50%;
  color: black;
  font-size: 8pt;
  display: block;
`;

export const RegularSection = styled.View`
  height: 100%;
  background-color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
`;

// Header section of the first page
export const HeaderSection = styled.View`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: row;
`;
export const HeaderImage = styled.Image`
  height: 84%;
  object-fit: contain;
`;

export const HeaderImageSection = styled.View`
  padding-top: 20px;
  position: relative;
  flex-basis: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
`;

export const HeaderTextSection = styled.View`
  position: relative;
  background-color: #ffffff;
  display: flex;
  color: #7d7e81;
  align-items: center;
  flex-basis: 50%;
  flex-direction: column;
  justify-content: space-between;
`;

export const HeaderLogoImage = styled.Image`
  width: 40px;
  position: absolute;
  z-index: 10;
  right: 23;
  top: 23;
`;

export const HeaderLogoImageRTL = styled.Image`
  width: 40px;
  position: absolute;
  z-index: 10;
  left: 23;
  top: 23;
`;

export const HeaderDate = styled.Text`
  color: #939598;
  font-size: 12pt;
  display: block;
  margin-top: 22px;
  width: 100%;
`;

export const HeaderDesign = styled.Text`
  color: #000000;
  font-size: 14pt;
  display: block;
  margin-top: 22px;
  height: 25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const HeaderProduct = styled.Text`
  color: #000000;
  font-size: 24pt;
  display: block;
  height: 32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;
export const HeaderDesc = styled.Text`
  color: #000000;
  font-size: 12pt;
  line-height: 1.1;
  display: block;
  margin-bottom: 25px;
  width: 100%;
`;
export const HeaderInfoTitle = styled.Text`
  color: #939598;
  font-size: 8pt;
  display: block;
  margin-bottom: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const HeaderInfoContent = styled.Text`
  color: #000000;
  font-size: 10pt;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HeaderCarSpecs = styled.View`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-bottom: 17px;
  width: 100%;
`;
export const HeaderCarSpecsItem = styled.View`
  position: relative;
  display: flex;
  flex-direction: column;
`;
export const HeaderCarSpecsTitle = styled.Text`
  color: #939598;
  font-size: 10pt;
  display: block;
  margin-bottom: 5px;
  text-transform: uppercase;
`;
export const HeaderCarSpecsInfo = styled.Text`
  color: #000000;
  font-size: 10pt;
  display: block;
`;

export const HeaderKeySpecsSection = styled.View`
  display: flex;
  flex-direction: row;
  align-items: left;
  margin-bottom: 15px;
  width: 100%;
`;

export const HeaderShareSection = styled.View`
  position: relative;
  display: flex;
  width: 100%;
  height: 55px;
  background-color: #007dc5;
  align-items: center;
`;
export const HeaderShareTitle = styled.Text`
  color: white;
  font-size: 12pt;
  display: block;
  margin-bottom: 5px;
`;
export const HeaderShareLink = styled.Link`
  color: #badaf3;
  font-size: 9pt;
  text-decoration: none;
  display: block;
`;

// General section items
export const SpecsHeader = styled.Text`
  color: #1085c9;
  font-size: 12pt;
  display: block;
  padding-bottom: 10px;
  text-transform: uppercase;
`;

// Design information section in the first page
export const DesignSection = styled.View`
  width: 100%;
  height: 90%;
  background-color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: row;
`;

export const DesignDefinition = styled.Text`
  color: #939598;
  font-size: 10pt;
  display: block;
  text-transform: uppercase;
  padding-top: 5px;
  border-bottom: 1px;
  border-color: #939598;
  border-style: solid;
`;

export const DesignDefinitionNoBorder = styled.Text`
  color: #939598;
  font-size: 10pt;
  display: block;
  text-transform: uppercase;
`;

export const WallTitle = styled.Text`
  color: black;
  font-size: 10pt;
  display: block;
  margin-bottom: 6px;
`;
export const DesignRowInfo = styled.View`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  padding-top: 5px;
`;
export const DesignRowInfoHigh = styled.View`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 5px;
`;

// car image page
export const CarImageRow = styled.View`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  height: 100%;
`;
// last page
export const BackCoverSection = styled.View`
  height: 100%;
  background-color: #ffffff;
  position: relative;
  padding-top: ${padding};
  margin-left: ${padding};
  margin-right: ${padding};
  padding-bottom: ${padding};
  display: flex;
  flex-direction: column;
`;

export const SloganImage = styled.Image`
  width: 227px;
  height: 30px;
  position: absolute;
  z-index: 10;
  right: 40px;
  top: 25px;
`;
export const SloganImageRTL = styled.Image`
  width: 227px;
  height: 30px;
  position: absolute;
  z-index: 10;
  left: 40px;
  top: 25px;
`;
export const LastPageNotes = styled.View`
  padding-top: 70px;
  width: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
`;
export const KoneNotes = styled.Text`
  color: #6d6e71;
  font-size: 11pt;
  display: block;
  padding-bottom: 10px;
`;
export const ContactHeader = styled.Text`
  padding-top: 15px;
  padding-bottom: 10px;
  color: #1085c9;
  font-size: 11pt;
  display: block;
  text-transform: uppercase;
`;
export const ContactText = styled.Text`
  padding-bottom: 2px;
  color: black;
  font-size: 11pt;
  display: block;
`;
export const ContactUrl = styled.Link`
  padding-bottom: 2px;
  color: #1085c9;
  font-size: 11pt;
  text-decoration: none;
  display: block;
`;
export const LegalNotes = styled.View`
  width: 100%;
  position: absolute;
  display: flex;
  text-align: center;
  flex-direction: column;
  bottom: 40px;
`;
export const LegalNotestext = styled.Text`
  color: #6d6e71;
  font-size: 8pt;
  display: block;
`;

// General thumbnail items
// border-radius: 20px;
export const FinishImage = styled.Image`
  margin-bottom: 9px;
`;
export const FinishName = styled.Text`
  color: black;
  font-size: 8pt;
  display: block;
`;
export const PremiumImage = styled.Image`
  width: 10px;
  height: 10px;
  margin-top: -22px;
  margin-bottom: 12px;
  margin-left: 6px;
`;
