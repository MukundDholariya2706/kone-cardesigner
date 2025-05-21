import React from 'react';
import { View, Document, Image, Text, Font, Link } from '@react-pdf/renderer';

import fp_bg from '../../assets/images/react.svg';
import logo from '../../assets/images/react.svg';
import slogan from '../../assets/images/react.svg';
import emptyWallIcon from '../../assets/icons/react.svg';

import apiIcon from '../../assets/icons/react.svg';
import connectIcon from '../../assets/icons/react.svg';
import maxSpeedIcon from '../../assets/icons/react.svg';
import maxTravelIcon from '../../assets/icons/react.svg';
import maxPersonsIcon from '../../assets/icons/react.svg';
import maxGroupsIcon from '../../assets/icons/react.svg';

import linkIcon from '../../assets/icons/react.svg';

import premiumIconEu from '../../assets/icons/react.svg';
import premiumIconInverseEU from '../../assets/icons/react.svg';
import premiumIconEna from '../../assets/icons/react.svg';
import premiumIconInverseEna from '../../assets/icons/react.svg';

import indHigh from '../../assets/images/react.svg';
import indLow from '../../assets/images/react.svg';
import indMiddle from '../../assets/images/react.svg';
import indHighLow from '../../assets/images/react.svg';
import indHighMiddle from '../../assets/images/react.svg';
import indHighMiddleLow from '../../assets/images/react.svg';
import indMiddleLow from '../../assets/images/react.svg';

import indFwFh from '../../assets/images/react.svg';
import indFwPh from '../../assets/images/react.svg';
import indPwMh from '../../assets/images/react.svg';
import indPwPh from '../../assets/images/react.svg';
import indNwPh from '../../assets/react.svg';

import font from '../../styles/fonts/KONE_Information_pdf.ttf';
import fontZh from '../../styles/fonts/wqy-MicroHei_pdf.ttf';

import {
  FullPage,
  RegularPage,
  HeaderImage,
  HeaderSection,
  HeaderImageSection,
  HeaderTextSection,
  HeaderLogoImage,
  HeaderLogoImageRTL,
  HeaderDesign,
  HeaderProduct,
  HeaderDesc,
  HeaderDate,
  HeaderInfoTitle,
  HeaderCarSpecs,
  HeaderCarSpecsItem,
  HeaderCarSpecsInfo,
  HeaderCarSpecsTitle,
  SpecsHeader,
  DesignSection,
  FinishImage,
  WallTitle,
  FinishName,
  DesignDefinition,
  DesignRowInfo,
  DesignRowInfoHigh,
  SloganImage,
  SloganImageRTL,
  LastPageNotes,
  KoneNotes,
  ContactHeader,
  ContactText,
  LegalNotes,
  LegalNotestext,
  BackCoverSection,
  RegularSection,
  CarImageRow,
  HeaderShareSection,
  HeaderShareTitle,
  HeaderShareLink,
  HeaderKeySpecsSection,
  ContactUrl,
  PremiumImage,
  HeaderInfoContent,
} from './PdfGeneratorStyles';

import { capitalizeString } from '../../utils/generalUtils';

import img247Services from '../../assets/images/react.svg';
import imgKoneInformation from '../../assets/images/react.svg';
import imgElevatorMusic from '../../assets/images/react.svg';
import imgElevatorCall from '../../assets/images/react.svg';
import imgRobotApi from '../../assets/images/react.svg';
import imgAirPurifier from '../../assets/images/react.svg';

import {
  KCSM_24_7_CONNECT,
  KCSM_AIR_PURIFIER,
  KCSM_APF_SERV_ROBOT_API,
  KCSM_ELEV_MUSIC,
  KCSM_KONE_INFORMATION,
  KCSM_MOBILE_ELEV_CALL,
  SEPARATE_HALL_INDICATORS,
} from '../../constants';

const PdfGenerator = (props) => {
  console.log({props})
  if (!props) {
    return undefined;
  }

  const bufferImages = {
    HIGH: indHigh,
    MIDDLE: indMiddle,
    LOW: indLow,
    HIGHLOW: indHighLow,
    HIGHMIDDLE: indHighMiddle,
    HIGHMIDDLELOW: indHighMiddleLow,
    MIDDLELOW: indMiddleLow,
  };

  const mirrorImages = {
    MR1FWFH: indFwFh,
    MR1FWPH: indFwPh,
    MR1PWMH: indPwMh,
    MR1PWPH: indPwPh,
    MR1NWPH: indNwPh,
  };
  // console.log({props})

  const {
    viewImages,
    productName,
    productDesc,
    productFacts,
    ktoc,
    ktocInfo,
    offeringLocation,
    regulationsAvailable,
    regulations,
    designName,
    designUrl,
    carShape,
    carType,
    digitalServices,
    digitalServicesUrls,
    wallA,
    wallB,
    wallC,
    wallD,
    decoPack,
    scenic,
    ceiling,
    floor,
    door,
    frame,
    cop,
    horCop,
    hi,
    hl,
    lcs,
    fb,
    eid,
    din,
    dop,
    handrail,
    mirror,
    bufferRail,
    skirting,
    tenantDirectory,
    infoScreen,
    seat,
    frontPageImage,
    galleryAngleImage,

    documentLanguage,

    generatedPdfImageBWall,
    generatedPdfImageCWall,
    generatedPdfImageDWall,

    generatedPdfImageFloor,

    addresses = {},
    domain,

    tenderInfo,
  } = props.data;

  const premiumIcon = offeringLocation === 'ENA' ? premiumIconEna : premiumIconEu;
  const premiumIconInverse = offeringLocation === 'ENA' ? premiumIconInverseEna : premiumIconInverseEU;
  const { writeDirection } = props;

  const getText = (str) => {
    return props.getText(str, writeDirection);
  };

  Font.register({
    family: 'KoneFont',
    src: font,
    weight: 'normal',
  });

  Font.register({
    family: 'ChinaFont',
    src: fontZh,
    weight: 'normal',
  });

  if (documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1) {
    Font.registerHyphenationCallback((word) => {
      let zh = false;

      Array.from(word).forEach((char) => {
        if (char.charCodeAt(0) === 12290 || char.charCodeAt(0) === 12289 || char.charCodeAt(0) >= 19968) {
          zh = true;
        }
      });

      if (!zh) {
        return [word];
      }

      return Array.from(word)
        .map((char) => [char, ''])
        .reduce((arr, current) => {
          arr.push(...current);
          return arr;
        }, []);
    });
  } else {
    Font.registerHyphenationCallback((word) => [word]);
  }

  const now = new Date();

  const checkBufferIcon = (positions) => {
    let heightPosition = '';
    if (positions.indexOf('HIGH') !== -1) {
      heightPosition += 'HIGH';
    }
    if (positions.indexOf('MIDDLE') !== -1) {
      heightPosition += 'MIDDLE';
    }
    if (positions.indexOf('LOW') !== -1) {
      heightPosition += 'LOW';
    }
    return bufferImages[heightPosition] || ' ';
  };

  const checkMirrorIcon = (id) => {
    return mirrorImages[id] || ' ';
  };

  const shortenTitle = (str, cutLength = 17) => {
    if (!str) return str;
    if (str.length > cutLength) {
      return str.substr(0, cutLength) + '...';
    }

    return str;
  };

  const generateWallTitle = (title, sapId, mixed = false, materials = [], showCenterPanel = true) => {
    if (!title || (Array.isArray(title) && title.length < 1)) {
      return ' ';
    }

    let thbTitle = title;
    if (sapId) {
      if (!Array.isArray(sapId)) {
        if (sapId !== void 0 && offeringLocation !== 'ENA') {
          thbTitle += '\n(' + sapId + ')';
        } else {
          thbTitle += '\n(' + getText('pdf-custom-material') + ')';
        }
      } else {
        if (sapId[0] !== void 0 && offeringLocation !== 'ENA') {
          thbTitle += '\n(' + sapId[0] + ')';
        } else {
          thbTitle += '\n(' + getText('pdf-custom-material') + ')';
        }
      }
    }

    if (Array.isArray(title)) {
      thbTitle = shortenTitle(getText(title[0]), 22);
      if (sapId) {
        if (!Array.isArray(sapId)) {
          if (sapId !== void 0 && offeringLocation !== 'ENA') {
            thbTitle += '\n(' + sapId + ')';
          } else {
            thbTitle += '\n(' + getText('pdf-custom-material') + ')';
          }
        } else {
          if (sapId[0] !== void 0) {
            if (offeringLocation !== 'ENA') {
              thbTitle += '\n(' + sapId[0] + ')';
            }
            thbTitle += ',' + (mixed ? '\n' + getText(materials[0]) : '');
          } else {
            thbTitle += '\n(' + getText('pdf-custom-material') + ')';
          }
        }
      }

      if (title.length > 1) {
        thbTitle = getText('ui-general-left-abbrev') + '. ' + thbTitle;

        // Not displaying the center panel finish for SOC 1100 width cars, as in these cases three panels in the design actually means two identical panels for the user and in the UI
        if (showCenterPanel) {
          thbTitle += '\n' + getText('ui-general-center-abbrev') + '. ' + shortenTitle(getText(title[1]), 22);

          if (sapId) {
            if (!Array.isArray(sapId)) {
              if (sapId !== void 0 && offeringLocation !== 'ENA') {
                thbTitle += '\n(' + sapId + ')';
              } else {
                thbTitle += '\n(' + getText('pdf-custom-material') + ')';
              }
            } else {
              if (sapId[1] !== void 0) {
                if (offeringLocation !== 'ENA') {
                  thbTitle += '\n(' + sapId[1] + ')';
                }
                thbTitle += ',' + (mixed ? '\n' + getText(materials[1]) : '');
              } else {
                thbTitle += '\n(' + getText('pdf-custom-material') + ')';
              }
            }
          }
        }
        thbTitle += '\n' + getText('ui-general-right-abbrev') + '. ' + shortenTitle(getText(title[2]), 22);
        if (sapId) {
          if (!Array.isArray(sapId)) {
            if (sapId !== void 0 && offeringLocation !== 'ENA') {
              thbTitle += '\n(' + sapId + ')';
            } else {
              thbTitle += '\n(' + getText('pdf-custom-material') + ')';
            }
          } else {
            if (sapId[2] !== void 0) {
              if (offeringLocation !== 'ENA') {
                thbTitle += '\n(' + sapId[2] + ')';
              }
              thbTitle += ',' + (mixed ? '\n' + getText(materials[2]) : '');
            } else {
              thbTitle += '\n(' + getText('pdf-custom-material') + ')';
            }
          }
        }
      }
    }
    return thbTitle;
  };

  const generateFloorTitle = (title, sapId, mixed, materials) => {
    if (!title || (Array.isArray(title) && title.length < 1)) {
      return ' ';
    }

    let thbTitle = title;
    if (sapId) {
      if (!Array.isArray(sapId)) {
        if (sapId !== void 0 && offeringLocation !== 'ENA') {
          thbTitle += ' (' + sapId + ')';
        } else {
          thbTitle += ' (' + getText('pdf-custom-material') + ')';
        }
      } else {
        if (sapId[0] !== void 0 && offeringLocation !== 'ENA') {
          thbTitle += ' (' + sapId[0] + ')';
        } else {
          thbTitle += ' (' + getText('pdf-custom-material') + ')';
        }
      }
    }

    if (Array.isArray(title)) {
      thbTitle = shortenTitle(getText(title[0]), 22);
      if (sapId) {
        if (!Array.isArray(sapId)) {
          if (sapId !== void 0 && offeringLocation !== 'ENA') {
            thbTitle += ' (' + sapId + ')';
          } else {
            thbTitle += ' (' + getText('pdf-custom-material') + ')';
          }
        } else {
          if (sapId[0] !== void 0) {
            if (offeringLocation !== 'ENA') {
              thbTitle += ' (' + sapId[0] + ')';
            }
            thbTitle += ',' + (mixed ? ' ' + getText(materials[0]?.name) : '');
          } else {
            thbTitle += ' (' + getText('pdf-custom-material') + ')';
          }
        }
      }

      if (title.length > 1) {
        thbTitle = getText('pdf-floor-base') + ': ' + thbTitle;
        thbTitle += '\n' + getText('pdf-floor-frame') + ': ' + shortenTitle(getText(title[1]), 22);
        if (sapId) {
          if (!Array.isArray(sapId)) {
            if (sapId !== void 0 && offeringLocation !== 'ENA') {
              thbTitle += ' (' + sapId + ')';
            } else {
              thbTitle += ' (' + getText('pdf-custom-material') + ')';
            }
          } else {
            if (sapId[1] !== void 0) {
              if (offeringLocation !== 'ENA') {
                thbTitle += ' (' + sapId[1] + ')';
              }
              thbTitle += ', ' + (mixed ? ' ' + getText(materials[1]?.name) : '');
            } else {
              thbTitle += ' (' + getText('pdf-custom-material') + ')';
            }
          }
        }
        if (title[2]) {
          thbTitle += '\n' + getText('pdf-floor-list') + ': ' + shortenTitle(getText(title[2]), 22);
        }
      }
    }

    return thbTitle;
  };

  const generateDisplayInfo = (displayInfo) => {
    if (!Array.isArray(displayInfo)) {
      return '';
    }

    let displayString = displayInfo[0] && getText(displayInfo[0]) + ': ';
    displayString += displayInfo[1] && getText(displayInfo[1]) + ', ';
    displayString += displayInfo[2] && getText(displayInfo[2]);

    return '\n' + displayString;
  };

  const arrToStr = (arrOfKeys) => {
    if (arrOfKeys.length < 1) {
      return '';
    }
    const translatedStrings = arrOfKeys.filter((item) => item !== null).map((item) => getText(item));
    return translatedStrings.join(', ');
  };

  const generateFinish = (finish, sapId, shortenTo = 22) => {
    return shortenTitle(getText(finish), shortenTo) + (offeringLocation === 'ENA' ? '' : ' (' + sapId + ')');
  };

  const generatePositions = (positionArr) => {
    let retVal = '';
    for (let i = 0; i < positionArr.length; i++) {
      retVal += ', ' + getText(positionArr[i]);
    }
    return retVal;
  };

  const calculateBasisValue = (componentsArr) => {
    const validComponents = componentsArr.filter((item) => item.type && item.type !== undefined);
    return validComponents.length;
  };

  const getImageDimensions = (genImg, statImg, w, h) => {

    if (!genImg && !statImg) {
      return [w + 'px', h + 'px'];
    }

    const imgW = (genImg?.width) ? genImg.width : statImg.w;
    const imgH = (genImg?.height) ? genImg.height : statImg.h;
   

    const ratioToBe = w / h;
    const ratioNow = imgW / imgH;

    let newW = 0;
    let newH = 0;

    if (ratioToBe < ratioNow) {
      newW = w;
      newH = w / ratioNow;
    } else {
      newH = h;
      newW = h * ratioNow;
    }

    const newSize = [newW + 'px', newH + 'px'];
    return newSize;
  };

  let ktocLoadText = '';
  if (ktocInfo) {
    if (ktocInfo.passengers) {
      ktocLoadText += `${ktocInfo.passengers} ${getText('ui-selector-load-capacity-persons')}`;

      // If both passenger amount and load amount defined, separate them with /
      if (ktocInfo.load) {
        ktocLoadText += '/';
      }
    }

    if (ktocInfo.load) {
      ktocLoadText += ktocInfo.load;
    }
  }

  const trueDigitalServices = digitalServices.includes(KCSM_AIR_PURIFIER)
    ? digitalServices
        .slice(0, digitalServices.indexOf(KCSM_AIR_PURIFIER))
        .concat(digitalServices.slice(digitalServices.indexOf(KCSM_AIR_PURIFIER) + 1, digitalServices.length))
    : digitalServices;

  const signalizationBasisValue = (100 / calculateBasisValue([horCop, hl, hi, lcs, fb, eid, dop, din])).toString() + '%';
  const signalizationMaxImgHeight = (120 / calculateBasisValue([horCop, hl, hi, lcs, fb, eid, dop, din])).toString() + 'px';
  
  return (
    <Document>
      <FullPage
        size='A4'
        orientation='landscape'
        style={
          documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1
            ? { fontFamily: 'ChinaFont' }
            : { fontFamily: 'KoneFont' }
        }
      >
        <Image
          src={fp_bg}
          style={{
            position: 'absolute',
            minHeight: '100%',
            minWidth: '50%',
            display: 'block',
            top: '0',
            left: '0',
            height: '100%',
            width: '50%',
          }}
        />
        <HeaderSection style={flexDirectionByLanguage(writeDirection)}>
          <HeaderImageSection>
            <HeaderImage
              src={viewImages[frontPageImage] && viewImages[frontPageImage].data ? viewImages[frontPageImage].data : emptyWallIcon}
            />
            <Text
              style={alignTextByLanguage(writeDirection, {
                fontSize: '10pt',
                color: '#939598',
                marginTop: '24px',
                marginLeft: '20px',
                marginRight: '20px',
              })}
            >
              {getText('pdf-illustration-notice')}
            </Text>
          </HeaderImageSection>
          {productFacts && productFacts.length > 0 ? (
            <HeaderTextSection>
              <View style={alignItemsByLanguage(writeDirection, { width: '89%' })}>
                {tenderInfo !== null ? (
                  <>
                    <HeaderCarSpecs
                      style={flexDirectionByLanguage(writeDirection, { marginTop: '23px', justifyContent: 'space-between', width: '82%' })}
                    >
                      <HeaderKTOCInfo
                        title={getText('pdf-opportunity-name')}
                        info={shortenTitle(tenderInfo.tender.opportunityNumber, 25)}
                        extraStyle={alignItemsByLanguage(writeDirection)}
                      />
                      <HeaderKTOCInfo
                        title={getText('pdf-tender-version')}
                        info={shortenTitle(tenderInfo.tender.tenderNumber + '-v' + tenderInfo.tender.tenderVersion, 25)}
                        extraStyle={alignItemsByLanguage(writeDirection)}
                      />
                      <HeaderKTOCInfo
                        title={getText('pdf-date-of-creation')}
                        info={shortenTitle(now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear(), 25)}
                        extraStyle={alignItemsByLanguage(writeDirection)}
                      />
                    </HeaderCarSpecs>
                    <HeaderDesign style={alignTextByLanguage(writeDirection, { marginTop: '0px' })}>
                      {tenderInfo.tender.customerName}, {tenderInfo.tender.opportunityName}
                    </HeaderDesign>
                  </>
                ) : (
                  <>
                    <HeaderDate style={alignTextByLanguage(writeDirection)}>
                      {now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear()}
                    </HeaderDate>
                    <HeaderDesign style={alignTextByLanguage(writeDirection)}>{getText(designName)}</HeaderDesign>
                  </>
                )}

                <HeaderProduct style={alignTextByLanguage(writeDirection)}>{getText(productName)}</HeaderProduct>
                <HeaderDesc style={alignTextByLanguage(writeDirection)}>{getText(productDesc)}</HeaderDesc>

                <View style={alignItemsByLanguage(writeDirection, { marginBottom: '7px', borderBottom: '1 solid #E2E3E4', width: '100%' })}>
                  <Text style={{ fontSize: '12pt', color: '#939598', textTransform: 'uppercase', marginBottom: '7px' }}>
                    {getText('ui-general-car-layout')}
                  </Text>
                </View>
                {regulationsAvailable && (
                  <>
                    <HeaderCarSpecs style={flexDirectionByLanguage(writeDirection)}>
                      {!ktoc &&
                        domain !== 'cardesigner.kone.cn' && ( // Should not show car dimensions in China or for KTOC designs
                          <HeaderCarInfo
                            title={getText('ui-general-car-shape')}
                            info={getText(carShape)}
                            extraStyle={alignItemsByLanguage(writeDirection, { flexBasis: '50%' })}
                          />
                        )}
                      <HeaderCarInfo
                        title={getText('ui-general-regulation')}
                        info={arrToStr(regulations)}
                        extraStyle={alignItemsByLanguage(writeDirection, { flexBasis: '50%' })}
                      />
                    </HeaderCarSpecs>
                    <HeaderCarSpecs style={flexDirectionByLanguage(writeDirection)}>
                      {ktoc && offeringLocation === 'ENA' && ktocInfo?.range ? (
                        <HeaderCarInfo
                          title={getText('ui-general-car-type')}
                          info={getText(carType) + ' ' + getText(ktocInfo.range)}
                          extraStyle={alignItemsByLanguage(writeDirection)}
                        />
                      ) : (
                        <HeaderCarInfo
                          title={getText('ui-general-car-type')}
                          info={getText(carType)}
                          extraStyle={alignItemsByLanguage(writeDirection)}
                        />
                      )}
                    </HeaderCarSpecs>
                  </>
                )}
                {!regulationsAvailable && (
                  <HeaderCarSpecs style={flexDirectionByLanguage(writeDirection)}>
                    {!ktoc && domain !== 'cardesigner.kone.cn' && (
                      <HeaderCarInfo
                        title={getText('ui-general-car-shape')}
                        info={getText(carShape)}
                        extraStyle={alignItemsByLanguage(writeDirection, { flexBasis: '50%' })}
                      />
                    )}
                    {ktoc && offeringLocation === 'ENA' && ktocInfo?.range ? (
                      <HeaderCarInfo
                        title={getText('ui-general-car-type')}
                        info={getText(carType) + ' ' + getText(ktocInfo.range)}
                        extraStyle={alignItemsByLanguage(writeDirection)}
                      />
                    ) : (
                      <HeaderCarInfo
                        title={getText('ui-general-car-type')}
                        info={getText(carType)}
                        extraStyle={alignItemsByLanguage(writeDirection)}
                      />
                    )}
                  </HeaderCarSpecs>
                )}

                <View style={alignItemsByLanguage(writeDirection, { marginBottom: '7px', borderBottom: '1 solid #E2E3E4', width: '100%' })}>
                  <Text style={{ fontSize: '12pt', color: '#939598', textTransform: 'uppercase', marginBottom: '7px' }}>
                    {getText('pdf-key-specifications')}
                  </Text>
                </View>

                {ktoc ? (
                  // ktoc product information
                  offeringLocation !== 'India' ? (
                    <HeaderKeySpecsSection style={flexDirectionByLanguage(writeDirection, alignItemsByLanguage(writeDirection))}>
                      <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxTravelIcon}
                          text={getText('pdf-ktoc-travel')}
                          scdLine={`${ktocInfo.travel}/${ktocInfo.floors} ${getText('pdf-max-floors')}`}
                        />
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxPersonsIcon}
                          text={getText('pdf-ktoc-load')}
                          scdLine={ktocLoadText}
                        />
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxSpeedIcon}
                          text={getText('pdf-ktoc-speed')}
                          scdLine={ktocInfo.speed}
                        />
                      </View>
                      <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxGroupsIcon}
                          text={getText('pdf-max-groups')}
                          scdLine={getText(productFacts[0].maxGroups ? productFacts[0].maxGroups : '')}
                        />
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={connectIcon}
                          text={getText(productFacts[0].connect ? productFacts[0].connect : 'pdf-not-connected')}
                          scdLine={null}
                        />
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={apiIcon}
                          text={getText(productFacts[0].api ? productFacts[0].api : 'pdf-api-not-ready')}
                          scdLine={null}
                        />
                      </View>
                    </HeaderKeySpecsSection>
                  ) : (
                    <HeaderKeySpecsSection style={flexDirectionByLanguage(writeDirection, alignItemsByLanguage(writeDirection))}>
                      <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxTravelIcon}
                          text={getText('pdf-ktoc-travel')}
                          scdLine={`${ktocInfo.travel}/${ktocInfo.floors} ${getText('pdf-max-floors')}`}
                        />
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxPersonsIcon}
                          text={getText('pdf-ktoc-load')}
                          scdLine={ktocLoadText}
                        />
                      </View>
                      <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxGroupsIcon}
                          text={getText('pdf-max-groups')}
                          scdLine={getText(productFacts[0].maxGroups ? productFacts[0].maxGroups : '')}
                        />
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxSpeedIcon}
                          text={getText('pdf-ktoc-speed')}
                          scdLine={ktocInfo.speed}
                        />
                      </View>
                    </HeaderKeySpecsSection>
                  )
                ) : // regular application design
                productFacts[0].api && productFacts[0].connect ? (
                  <HeaderKeySpecsSection style={flexDirectionByLanguage(writeDirection, alignItemsByLanguage(writeDirection))}>
                    <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={maxTravelIcon}
                        text={getText('pdf-max-travel')}
                        scdLine={
                          (productFacts[0].maxTravel ? getText(productFacts[0].maxTravel) : '') +
                          (productFacts[0].maxFloors ? '/' + getText(productFacts[0].maxFloors) + ' ' + getText('pdf-max-floors') : '')
                        }
                      />
                      {offeringLocation !== 'ENA' ? (
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxPersonsIcon}
                          text={getText('pdf-max-load')}
                          scdLine={
                            (productFacts[0].maxPersons
                              ? getText(productFacts[0].maxPersons) + ' ' + getText('ui-selector-load-capacity-persons')
                              : '') + (productFacts[0].maxLoad ? '/' + getText(productFacts[0].maxLoad) : '')
                          }
                        />
                      ) : (
                        <HeaderKeySpecsItem
                          dirStyle={flexDirectionByLanguage(writeDirection)}
                          image={maxPersonsIcon}
                          text={getText('pdf-max-load')}
                          scdLine={productFacts[0].maxLoad ? getText(productFacts[0].maxLoad) : ''}
                        />
                      )}
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={maxSpeedIcon}
                        text={getText('pdf-max-speed')}
                        scdLine={productFacts[0].maxSpeed ? getText(productFacts[0].maxSpeed) : ''}
                      />
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={maxGroupsIcon}
                        text={getText('pdf-max-groups')}
                        scdLine={getText(productFacts[0].maxGroups ? productFacts[0].maxGroups : '')}
                      />
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={connectIcon}
                        text={getText(productFacts[0].connect ? productFacts[0].connect : 'pdf-not-connected')}
                        scdLine={null}
                      />
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={apiIcon}
                        text={getText(productFacts[0].api ? productFacts[0].api : 'pdf-api-not-ready')}
                        scdLine={null}
                      />
                    </View>
                  </HeaderKeySpecsSection>
                ) : (
                  <HeaderKeySpecsSection style={flexDirectionByLanguage(writeDirection, alignItemsByLanguage(writeDirection))}>
                    <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={maxTravelIcon}
                        text={getText('pdf-max-travel')}
                        scdLine={
                          (productFacts[0].maxTravel ? getText(productFacts[0].maxTravel) : '') +
                          (productFacts[0].maxFloors ? '/' + getText(productFacts[0].maxFloors) + ' ' + getText('pdf-max-floors') : '')
                        }
                      />
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={maxPersonsIcon}
                        text={getText('pdf-max-load')}
                        scdLine={
                          (productFacts[0].maxPersons
                            ? getText(productFacts[0].maxPersons) + ' ' + getText('ui-selector-load-capacity-persons')
                            : '') + (productFacts[0].maxLoad ? '/' + getText(productFacts[0].maxLoad) : '')
                        }
                      />
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%' }}>
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={maxGroupsIcon}
                        text={getText('pdf-max-groups')}
                        scdLine={getText(productFacts[0].maxGroups ? productFacts[0].maxGroups : '')}
                      />
                      <HeaderKeySpecsItem
                        dirStyle={flexDirectionByLanguage(writeDirection)}
                        image={maxSpeedIcon}
                        text={getText('pdf-max-speed')}
                        scdLine={productFacts[0].maxSpeed ? getText(productFacts[0].maxSpeed) : ''}
                      />
                    </View>
                  </HeaderKeySpecsSection>
                )}
              </View>
              {designUrl && (
                <HeaderShareSection style={flexDirectionByLanguage(writeDirection, { paddingBottom: '2px' })}>
                  <View style={{ flexBasis: '15%', display: 'flex', alignItems: 'center' }}>
                    <Image src={linkIcon} style={{ width: '33px' }} />
                  </View>
                  <View
                    style={alignItemsByLanguage(writeDirection, {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '85%',
                      marginBottom: '4px',
                    })}
                  >
                    <HeaderShareTitle>{getText('pdf-view-design-link-title')}</HeaderShareTitle>
                    <HeaderShareLink src={designUrl || ''} style={{ textDecoration: 'none' }}>
                      {designUrl || ''}
                    </HeaderShareLink>
                  </View>
                </HeaderShareSection>
              )}
            </HeaderTextSection>
          ) : (
            <HeaderTextSection>
              <View style={alignItemsByLanguage(writeDirection, { width: '82%', height: '100%' })}>
                <HeaderDate style={alignTextByLanguage(writeDirection)}>
                  {now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear()}
                </HeaderDate>
                <HeaderDesign style={alignTextByLanguage(writeDirection)}>{getText(designName)}</HeaderDesign>
                <HeaderProduct style={alignTextByLanguage(writeDirection)}>{getText(productName)}</HeaderProduct>

                <View style={alignItemsByLanguage(writeDirection, { marginBottom: '7px', borderBottom: '1 solid #E2E3E4', width: '100%' })}>
                  <Text style={{ fontSize: '12pt', color: '#939598', textTransform: 'uppercase', marginBottom: '7px' }}>
                    {getText('ui-general-car-layout')}
                  </Text>
                </View>
                <HeaderCarSpecs style={flexDirectionByLanguage(writeDirection)}>
                  {!ktoc && domain !== 'cardesigner.kone.cn' && (
                    <HeaderCarInfo
                      title={getText('ui-general-car-shape')}
                      info={getText(carShape)}
                      extraStyle={alignItemsByLanguage(writeDirection, { flexBasis: '50%' })}
                    />
                  )}
                  <HeaderCarInfo
                    title={getText('ui-general-regulation')}
                    info={getText(regulations)}
                    extraStyle={alignItemsByLanguage(writeDirection, { flexBasis: '50%' })}
                  />
                </HeaderCarSpecs>

                <HeaderCarSpecs style={flexDirectionByLanguage(writeDirection)}>
                  <HeaderCarInfo
                    title={getText('ui-general-car-type')}
                    info={getText(carType)}
                    extraStyle={alignItemsByLanguage(writeDirection)}
                  />
                </HeaderCarSpecs>
                <HeaderDesc style={alignTextByLanguage(writeDirection)}>{getText('pdf-addondeco-desc')}</HeaderDesc>
              </View>
              {designUrl && (
                <HeaderShareSection style={flexDirectionByLanguage(writeDirection)}>
                  <View style={{ flexBasis: '15%', display: 'flex', alignItems: 'center' }}>
                    <Image src={linkIcon} style={{ width: '33px' }} />
                  </View>
                  <View
                    style={alignItemsByLanguage(writeDirection, {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '85%',
                      marginBottom: '4px',
                    })}
                  >
                    <HeaderShareTitle>{getText('pdf-view-design-link-title')}</HeaderShareTitle>
                    <HeaderShareLink src={designUrl || ''} style={{ textDecoration: 'none' }}>
                      {designUrl || ''}
                    </HeaderShareLink>
                  </View>
                </HeaderShareSection>
              )}
            </HeaderTextSection>
          )}
        </HeaderSection>
        {writeDirection === 'rtl' ? <HeaderLogoImageRTL src={logo} /> : <HeaderLogoImage src={logo} />}
      </FullPage>

      {
        // Page two with decoPack or scenic
      }
      {((decoPack.id && decoPack.id !== 'DECO0') || scenic) && (
        <RegularPage
          size='A4'
          orientation='landscape'
          style={
            documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1
              ? { fontFamily: 'ChinaFont', paddingBottom: '0px' }
              : { fontFamily: 'KoneFont', paddingBottom: '0px' }
          }
        >
          <SpecsHeader style={alignTextByLanguage(writeDirection)}>{getText('pdf-materials-accessories')}</SpecsHeader>
          <DesignSection style={flexDirectionByLanguage(writeDirection)}>
            <View style={{ flexBasis: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {
                //  first column  }
              }
              <View
                style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                  flexBasis: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  width: '100%',
                })}
              >
                <SpecsItem
                  title={decoPack.id && decoPack.id !== 'DECO0' ? getText('pdf-deco-glass-combinations') : getText('pdf-scenic-glass-car')}
                  extraStyle={alignTextByLanguage(writeDirection)}
                >
                  <View style={{ display: 'flex', flexDirection: 'row', maxWidth: '500px', marginTop: '16px', marginBottom: '16px' }}>
                    <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '25%' }}>
                      <Image
                        src={viewImages.angleFront && viewImages.angleFront.data ? viewImages.angleFront.data : emptyWallIcon}
                        style={{ height: '150px', objectFit: 'contain' }}
                      />
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '25%' }}>
                      <Image
                        src={
                          viewImages.angleFrontOpposite && viewImages.angleFrontOpposite.data
                            ? viewImages.angleFrontOpposite.data
                            : emptyWallIcon
                        }
                        style={{ height: '150px', objectFit: 'contain' }}
                      />
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', flexBasis: '25%' }}>
                      <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row', flexBasis: '50%' })}>
                        {scenic && scenic.id && (
                          <>
                            <Image
                              src={scenic.image}
                              style={adjustPaddingByLanguage(writeDirection, 'left', '8px', { maxHeight: '26px' })}
                            />
                            <Text style={{ fontSize: '8pt', color: 'black', paddingRight: '5px', paddingLeft: '5px', paddingTop: '5px' }}>
                              {shortenTitle(getText(scenic.label), 24)}
                            </Text>
                          </>
                        )}
                        {decoPack && decoPack.id && decoPack.id !== 'DECO0' && (
                          <>
                            <Image
                              src={decoPack.image}
                              style={adjustPaddingByLanguage(writeDirection, 'left', '8px', { height: '26px' })}
                            />
                            <Text style={{ fontSize: '8pt', color: 'black', paddingRight: '5px', paddingLeft: '5px', paddingTop: '5px' }}>
                              {getText(decoPack.label)}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </SpecsItem>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '60%',
                  width: '100%',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  marginRight: '24px',
                }}
              >
                <View
                  style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                    flexBasis: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    width: '100%',
                  })}
                >
                  <SpecsItem title={getText('ui-general-wall-finishes')} extraStyle={alignTextByLanguage(writeDirection)}>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: '16px',
                        marginBottom: '38px',
                      }}
                    >
                      <DesignRowInfo
                        style={alignItemsByLanguage(
                          writeDirection,
                          adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px' })
                        )}
                      >
                        <WallTitle>{getText('pdf-wall-a')}</WallTitle>
                        <FinishItem
                          title={
                            wallA.finishes && wallA.finishes.length > 0
                              ? generateWallTitle(wallA.finishes, wallA.sapIds, wallA.mixed, wallA.materials)
                              : getText('ui-general-no-selection')
                          }
                          subtitle={wallA.mixed || wallA.materials.length < 1 ? null : shortenTitle(getText(wallA.materials[0]), 22)}
                          thumbnail={wallA.pdfImages ? wallA.pdfImages : emptyWallIcon}
                          premium={wallA.premium}
                          mixed={wallA.mixed}
                          imageWidth={'75px'}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfo>
                      <DesignRowInfo
                        style={alignItemsByLanguage(
                          writeDirection,
                          adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px' })
                        )}
                      >
                        <WallTitle>{getText('pdf-wall-b')}</WallTitle>
                        <FinishItem
                          title={
                            wallB.finishes && wallB.finishes.length > 0
                              ? generateWallTitle(wallB.finishes, wallB.sapIds, wallB.mixed, wallB.materials)
                              : getText('ui-general-no-selection')
                          }
                          subtitle={wallB.mixed || wallB.materials.length < 1 ? null : shortenTitle(getText(wallB.materials[0]), 22)}
                          thumbnail={wallB.mixed ? generatedPdfImageBWall : wallB.pdfImages ? wallB.pdfImages : emptyWallIcon}
                          premium={wallB.premium}
                          mixed={wallB.mixed}
                          imageWidth={'75px'}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfo>
                      <DesignRowInfo
                        style={alignItemsByLanguage(
                          writeDirection,
                          adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px' })
                        )}
                      >
                        <WallTitle>{getText('pdf-wall-c')}</WallTitle>
                        <FinishItem
                          title={
                            wallC.finishes && wallC.finishes.length > 0
                              ? generateWallTitle(wallC.finishes, wallC.sapIds, wallC.mixed, wallC.materials, !wallC.panelingException)
                              : getText('ui-general-no-selection')
                          }
                          subtitle={wallC.mixed || wallC.materials.length < 1 ? null : shortenTitle(getText(wallC.materials[0]), 22)}
                          thumbnail={wallC.mixed ? generatedPdfImageCWall : wallC.pdfImages ? wallC.pdfImages : emptyWallIcon}
                          premium={wallC.premium}
                          mixed={wallC.mixed}
                          imageWidth={'75px'}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfo>
                      <DesignRowInfo
                        style={alignItemsByLanguage(
                          writeDirection,
                          adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px' })
                        )}
                      >
                        <WallTitle>{getText('pdf-wall-d')}</WallTitle>
                        <FinishItem
                          title={
                            wallD.finishes && wallD.finishes.length > 0
                              ? generateWallTitle(wallD.finishes, wallD.sapIds, wallD.mixed, wallD.materials)
                              : getText('ui-general-no-selection')
                          }
                          subtitle={wallD.mixed || wallD.materials.length < 1 ? null : shortenTitle(getText(wallD.materials[0]), 22)}
                          thumbnail={wallD.mixed ? generatedPdfImageDWall : wallD.pdfImages ? wallD.pdfImages : emptyWallIcon}
                          premium={wallD.premium}
                          mixed={wallD.mixed}
                          imageWidth={'75px'}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfo>
                    </View>
                  </SpecsItem>
                </View>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                  {(wallA.premium || wallB.premium || wallC.premium || wallD.premium || (decoPack && decoPack.id !== 'DECO0')) && (
                    <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row', paddingTop: '7px' })}>
                      <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row', flexBasis: '50%' })}>
                        {(wallA.premium || wallB.premium || wallC.premium || wallD.premium) && (
                          <>
                            <Image src={premiumIconInverse} style={{ width: '15px', height: '15px' }} />
                            <Text style={{ fontSize: '8pt', color: 'black', paddingRight: '5px', paddingLeft: '5px', paddingTop: '4px' }}>
                              {getText('ui-general-extended-lead-time')}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View
              style={{ flexBasis: 'auto', display: 'flex', flexDirection: 'column', height: '100%', marginRight: '95px', maxWidth: '50%' }}
            >
              {
                //  second column
              }
              <View
                style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '16px',
                  maxWidth: '75%',
                })}
              >
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '16px',
                    })}
                  >
                    <SpecsItem
                      title={getText('ui-general-floor-finish')}
                      extraStyle={alignTextByLanguage(writeDirection)}
                      style={{ marginBottom: '16px' }}
                    >
                      <DesignRowInfo style={alignItemsByLanguage(writeDirection, adjustPaddingByLanguage(writeDirection))}>
                        <WallTitle> </WallTitle>
                        {/* <FinishItem title={floor.finishes ?floor.finishes : getText('ui-general-no-selection')} thumbnail={(floor.pdfImages ?floor.pdfImages :emptyWallIcon)} imageWidth={'45px'} getText={getText} /> */}
                        {offeringLocation !== 'ENA' && (
                          <FinishItem
                            title={
                              floor.finishes && floor.finishes.length > 0
                                ? generateFloorTitle(floor.finishes, floor.sapIds, floor.mixed, floor.materials)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={
                              floor.mixed || floor.materials.length < 1 ? null : capitalizeString(getText(floor.materials[0]?.name))
                            }
                            thumbnail={floor.mixed ? generatedPdfImageFloor : floor.pdfImages ? floor.pdfImages : emptyWallIcon}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        )}
                        {offeringLocation === 'ENA' && (
                          <FinishItem
                            title={
                              floor.finishes && floor.finishes.length > 0
                                ? getText('ui-general-floor-ena-notice')
                                : getText('ui-general-no-selection')
                            }
                            thumbnail={floor.mixed ? generatedPdfImageFloor : floor.pdfImages ? floor.pdfImages : emptyWallIcon}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        )}
                      </DesignRowInfo>
                    </SpecsItem>
                  </View>
                  <View style={adjustPaddingByLanguage(writeDirection, 'right', '15px', { display: 'flex', flexDirection: 'column' })}>
                    <SpecsItem title={getText('ui-general-ceiling')} extraStyle={alignTextByLanguage(writeDirection)}>
                      <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', marginTop: '16px' })}>
                        <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                          <FinishItem
                            title={
                              ceiling.type && ceiling.finish
                                ? getText(ceiling.type) + ', ' + generateFinish(ceiling.finish, ceiling.sapId)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={ceiling.lightFinish ? getText('ui-ceiling-spot-color') + ': ' + getText(ceiling.lightFinish) : null}
                            sapId={ceiling.sapId ? ceiling.sapId : null}
                            thumbnail={viewImages.ceilingImg && viewImages.ceilingImg.data ? viewImages.ceilingImg.data : emptyWallIcon}
                            extraStyle={alignTextByLanguage(writeDirection)}
                            imageWidth={'245px'}
                            premiumIcon={premiumIcon}
                          />
                        </DesignRowInfoHigh>
                      </View>
                    </SpecsItem>
                  </View>
                </View>
              </View>

              <View
                style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: '16px',
                })}
              >
                <SpecsItem
                  title={getText('ui-general-door')}
                  extraStyle={alignTextByLanguage(writeDirection)}
                  style={{ marginBottom: '16px' }}
                >
                  <View
                    style={flexDirectionByLanguage(writeDirection, { flexBasis: '60%', display: 'flex', justifyContent: 'space-between' })}
                  >
                    <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                      <FinishItem
                        thumbnail={viewImages.landingPdf && viewImages.landingPdf.data ? viewImages.landingPdf.data : emptyWallIcon}
                        imageWidth={'100%'}
                        subtitle={null}
                        title={null}
                        extraStyle={alignTextByLanguage(writeDirection)}
                        premiumIcon={premiumIcon}
                      />
                    </DesignRowInfoHigh>
                  </View>
                </SpecsItem>

                <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row' })}>
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '50%',
                    })}
                  >
                    <SpecsItem
                      title={getText('ui-general-door-type')}
                      extraStyle={alignTextByLanguage(writeDirection, { borderBottom: 'none' })}
                    >
                      <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                        <FinishItem
                          title={door.type ? getText(door.type) + ', ' + getText(frame.type) : getText('ui-general-no-selection')}
                          subtitle={null}
                          thumbnail={null}
                          extraStyle={alignTextByLanguage(writeDirection)}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfoHigh>
                    </SpecsItem>
                  </View>
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'left', '5px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '50%',
                    })}
                  >
                    <SpecsItem
                      title={getText('ui-general-door-finish')}
                      extraStyle={alignTextByLanguage(writeDirection, { borderBottom: 'none' })}
                    >
                      <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                        <FinishItem
                          title={door.finish ? generateFinish(door.finish, door.sapId) : getText('ui-general-no-selection')}
                          subtitle={null}
                          thumbnail={null}
                          extraStyle={alignTextByLanguage(writeDirection)}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfoHigh>
                    </SpecsItem>
                    <SpecsItem
                      title={getText('ui-door-frame-finish')}
                      extraStyle={alignTextByLanguage(writeDirection, { borderBottom: 'none' })}
                    >
                      <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                        <FinishItem
                          title={frame.finish ? generateFinish(frame.finish, frame.sapId, 50) : getText('ui-general-no-selection')}
                          subtitle={null}
                          thumbnail={null}
                          extraStyle={alignTextByLanguage(writeDirection)}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfoHigh>
                    </SpecsItem>
                  </View>
                </View>
              </View>
            </View>
          </DesignSection>
        </RegularPage>
      )}
      {
        // page two without decoPack & scenic
      }
      {!(decoPack.id && decoPack.id !== 'DECO0') && !scenic && (
        <RegularPage
          size='A4'
          orientation='landscape'
          style={
            documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1
              ? { fontFamily: 'ChinaFont', paddingBottom: '0px' }
              : { fontFamily: 'KoneFont', paddingBottom: '0px' }
          }
        >
          <SpecsHeader style={alignTextByLanguage(writeDirection)}>{getText('pdf-materials-accessories')}</SpecsHeader>
          <DesignSection style={flexDirectionByLanguage(writeDirection)}>
            <View style={{ flexBasis: 'auto', display: 'flex', flexDirection: 'column', height: '100%', marginRight: '95px' }}>
              {
                //  first column  }
              }
              <View style={{ display: 'flex', flexDirection: 'row', width: '80%', marginBottom: '10px' }}>
                <View
                  style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                    flexBasis: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    width: '100%',
                  })}
                >
                  <SpecsItem title={getText('ui-general-wall-finishes')} extraStyle={alignTextByLanguage(writeDirection)}>
                    <View style={{ display: 'flex', flexDirection: 'column', marginBottom: '64px' }}>
                      <View
                        style={flexDirectionByLanguage(writeDirection, {
                          display: 'flex',
                          flexDirection: 'row',
                          marginTop: '16px',
                          justifyContent: 'space-between',
                        })}
                      >
                        <DesignRowInfo
                          style={alignItemsByLanguage(
                            writeDirection,
                            adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px', marginRight: '24px' })
                          )}
                        >
                          <WallTitle>{getText('pdf-wall-a')}</WallTitle>
                          <FinishItem
                            title={
                              wallA.finishes && wallA.finishes.length > 0
                                ? generateWallTitle(wallA.finishes, wallA.sapIds, wallA.mixed, wallA.materials)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={wallA.mixed || wallA.materials.length < 1 ? null : getText(wallA.materials[0])}
                            thumbnail={wallA.pdfImages ? wallA.pdfImages : emptyWallIcon}
                            premium={wallA.premium}
                            mixed={wallA.mixed}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        </DesignRowInfo>
                        <DesignRowInfo
                          style={alignItemsByLanguage(
                            writeDirection,
                            adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px' })
                          )}
                        >
                          <WallTitle>{getText('pdf-wall-b')}</WallTitle>
                          <FinishItem
                            title={
                              wallB.finishes && wallB.finishes.length > 0
                                ? generateWallTitle(wallB.finishes, wallB.sapIds, wallB.mixed, wallB.materials)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={wallB.mixed || wallB.materials.length < 1 ? null : getText(wallB.materials[0])}
                            thumbnail={wallB.mixed ? generatedPdfImageBWall : wallB.pdfImages ? wallB.pdfImages : emptyWallIcon}
                            premium={wallB.premium}
                            mixed={wallB.mixed}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        </DesignRowInfo>
                      </View>
                      <View
                        style={flexDirectionByLanguage(writeDirection, {
                          display: 'flex',
                          flexDirection: 'row',
                          marginTop: '16px',
                          justifyContent: 'space-between',
                        })}
                      >
                        <DesignRowInfo
                          style={alignItemsByLanguage(
                            writeDirection,
                            adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px', marginRight: '24px' })
                          )}
                        >
                          <WallTitle>{getText('pdf-wall-c')}</WallTitle>
                          <FinishItem
                            title={
                              wallC.finishes && wallC.finishes.length > 0
                                ? generateWallTitle(wallC.finishes, wallC.sapIds, wallC.mixed, wallC.materials, !wallC.panelingException)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={wallC.mixed || wallC.materials.length < 1 ? null : getText(wallC.materials[0])}
                            thumbnail={wallC.mixed ? generatedPdfImageCWall : wallC.pdfImages ? wallC.pdfImages : emptyWallIcon}
                            premium={wallC.premium}
                            mixed={wallC.mixed}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        </DesignRowInfo>
                        <DesignRowInfo
                          style={alignItemsByLanguage(
                            writeDirection,
                            adjustPaddingByLanguage(writeDirection, { marginTop: '8px', marginBottom: '8px' })
                          )}
                        >
                          <WallTitle>{getText('pdf-wall-d')}</WallTitle>
                          <FinishItem
                            title={
                              wallD.finishes && wallD.finishes.length > 0
                                ? generateWallTitle(wallD.finishes, wallD.sapIds, wallD.mixed, wallD.materials)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={wallD.mixed || wallD.materials.length < 1 ? null : getText(wallD.materials[0])}
                            thumbnail={wallD.mixed ? generatedPdfImageDWall : wallD.pdfImages ? wallD.pdfImages : emptyWallIcon}
                            premium={wallD.premium}
                            mixed={wallD.mixed}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        </DesignRowInfo>
                      </View>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column' }}>
                      {(wallA.premium || wallB.premium || wallC.premium || wallD.premium || (decoPack && decoPack.id !== 'DECO0')) && (
                        <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row', paddingTop: '7px' })}>
                          <View
                            style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row', flexBasis: '50%' })}
                          >
                            {(wallA.premium || wallB.premium || wallC.premium || wallD.premium) && (
                              <>
                                <Image src={premiumIconInverse} style={{ width: '15px', height: '15px' }} />
                                <Text
                                  style={{ fontSize: '8pt', color: 'black', paddingRight: '5px', paddingLeft: '5px', paddingTop: '4px' }}
                                >
                                  {getText('ui-general-extended-lead-time')}
                                </Text>
                              </>
                            )}
                          </View>
                          <View
                            style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row', flexBasis: '50%' })}
                          >
                            {decoPack && decoPack.id && decoPack.id !== 'DECO0' && (
                              <>
                                <Image
                                  src={decoPack.image}
                                  style={adjustPaddingByLanguage(writeDirection, 'left', '8px', { height: '26px' })}
                                />
                                <Text
                                  style={{ fontSize: '8pt', color: 'black', paddingRight: '5px', paddingLeft: '5px', paddingTop: '5px' }}
                                >
                                  {getText(decoPack.label)}
                                </Text>
                              </>
                            )}
                            {scenic && scenic.id && (
                              <>
                                <Image
                                  src={scenic.image}
                                  style={adjustPaddingByLanguage(writeDirection, 'left', '8px', { height: '26px' })}
                                />
                                <Text
                                  style={{ fontSize: '8pt', color: 'black', paddingRight: '5px', paddingLeft: '5px', paddingTop: '5px' }}
                                >
                                  {getText(scenic.label)}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </SpecsItem>
                </View>
              </View>
            </View>
            <View
              style={{ flexBasis: 'auto', display: 'flex', flexDirection: 'column', height: '100%', marginRight: '95px', maxWidth: '50%' }}
            >
              {
                //  second column
              }
              <View
                style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '16px',
                  maxWidth: '75%',
                })}
              >
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '16px',
                    })}
                  >
                    <SpecsItem
                      title={getText('ui-general-floor-finish')}
                      extraStyle={alignTextByLanguage(writeDirection)}
                      style={{ marginBottom: '16px' }}
                    >
                      <DesignRowInfo
                        style={alignItemsByLanguage(writeDirection, adjustPaddingByLanguage(writeDirection, { marginRight: '24px' }))}
                      >
                        <WallTitle> </WallTitle>
                        {/* <FinishItem title={floor.finishes ?floor.finishes : getText('ui-general-no-selection')} thumbnail={(floor.pdfImages ?floor.pdfImages :emptyWallIcon)} imageWidth={'45px'} getText={getText} /> */}
                        {offeringLocation !== 'ENA' && (
                          <FinishItem
                            title={
                              floor.finishes && floor.finishes.length > 0
                                ? generateFloorTitle(floor.finishes, floor.sapIds, floor.mixed, floor.materials)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={
                              floor.mixed || floor.materials.length < 1 ? null : capitalizeString(getText(floor.materials[0]?.name))
                            }
                            thumbnail={floor.mixed ? generatedPdfImageFloor : floor.pdfImages ? floor.pdfImages : emptyWallIcon}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        )}
                        {offeringLocation === 'ENA' && (
                          <FinishItem
                            title={
                              floor.finishes && floor.finishes.length > 0
                                ? getText('ui-general-floor-ena-notice')
                                : getText('ui-general-no-selection')
                            }
                            thumbnail={floor.mixed ? generatedPdfImageFloor : floor.pdfImages ? floor.pdfImages : emptyWallIcon}
                            imageWidth={'110px'}
                            premiumIcon={premiumIcon}
                          />
                        )}
                      </DesignRowInfo>
                    </SpecsItem>
                  </View>
                  <View style={adjustPaddingByLanguage(writeDirection, 'right', '15px', { display: 'flex', flexDirection: 'column' })}>
                    <SpecsItem title={getText('ui-general-ceiling')} extraStyle={alignTextByLanguage(writeDirection)}>
                      <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', marginTop: '16px' })}>
                        <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                          <FinishItem
                            title={
                              ceiling.type && ceiling.finish
                                ? getText(ceiling.type) + ', ' + generateFinish(ceiling.finish, ceiling.sapId)
                                : getText('ui-general-no-selection')
                            }
                            subtitle={ceiling.lightFinish ? getText('ui-ceiling-spot-color') + ': ' + getText(ceiling.lightFinish) : null}
                            sapId={ceiling.sapId ? ceiling.sapId : null}
                            thumbnail={viewImages.ceilingImg && viewImages.ceilingImg.data ? viewImages.ceilingImg.data : emptyWallIcon}
                            extraStyle={alignTextByLanguage(writeDirection)}
                            imageWidth={'245px'}
                            premiumIcon={premiumIcon}
                          />
                        </DesignRowInfoHigh>
                      </View>
                    </SpecsItem>
                  </View>
                </View>
              </View>

              <View
                style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: '16px',
                })}
              >
                <SpecsItem
                  title={getText('ui-general-door')}
                  extraStyle={alignTextByLanguage(writeDirection)}
                  style={{ marginBottom: '16px' }}
                >
                  <View
                    style={flexDirectionByLanguage(writeDirection, { flexBasis: '60%', display: 'flex', justifyContent: 'space-between' })}
                  >
                    <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                      <FinishItem
                        thumbnail={viewImages.landingPdf && viewImages.landingPdf.data ? viewImages.landingPdf.data : emptyWallIcon}
                        imageWidth={'100%'}
                        imageHeight={'auto'}
                        subtitle={null}
                        title={null}
                        extraStyle={alignTextByLanguage(writeDirection)}
                        premiumIcon={premiumIcon}
                      />
                    </DesignRowInfoHigh>
                  </View>
                </SpecsItem>

                <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row' })}>
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '50%',
                    })}
                  >
                    <SpecsItem
                      title={getText('ui-general-door-type')}
                      extraStyle={alignTextByLanguage(writeDirection, { borderBottom: 'none' })}
                    >
                      <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                        <FinishItem
                          title={door.type ? getText(door.type) + ', ' + getText(frame.type) : getText('ui-general-no-selection')}
                          subtitle={null}
                          thumbnail={null}
                          extraStyle={alignTextByLanguage(writeDirection)}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfoHigh>
                    </SpecsItem>
                  </View>
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'left', '5px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '50%',
                    })}
                  >
                    <SpecsItem
                      title={getText('ui-general-door-finish')}
                      extraStyle={alignTextByLanguage(writeDirection, { borderBottom: 'none' })}
                    >
                      <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                        <FinishItem
                          title={door.finish ? generateFinish(door.finish, door.sapId) : getText('ui-general-no-selection')}
                          subtitle={null}
                          thumbnail={null}
                          extraStyle={alignTextByLanguage(writeDirection)}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfoHigh>
                    </SpecsItem>
                    <SpecsItem
                      title={getText('ui-door-frame-finish')}
                      extraStyle={alignTextByLanguage(writeDirection, { borderBottom: 'none' })}
                    >
                      <DesignRowInfoHigh style={alignContentByLanguage(writeDirection)}>
                        <FinishItem
                          title={frame.finish ? generateFinish(frame.finish, frame.sapId, 50) : getText('ui-general-no-selection')}
                          subtitle={null}
                          thumbnail={null}
                          extraStyle={alignTextByLanguage(writeDirection)}
                          premiumIcon={premiumIcon}
                        />
                      </DesignRowInfoHigh>
                    </SpecsItem>
                  </View>
                </View>
              </View>
            </View>
          </DesignSection>
        </RegularPage>
      )}
      {
        // Page Three
      }

      <RegularPage
        size='A4'
        orientation='landscape'
        style={
          documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1
            ? { fontFamily: 'ChinaFont', paddingBottom: '0px' }
            : { fontFamily: 'KoneFont', paddingBottom: '0px' }
        }
      >
        <SpecsHeader style={alignTextByLanguage(writeDirection)}>{getText('pdf-materials-accessories')}</SpecsHeader>
        <DesignSection style={flexDirectionByLanguage(writeDirection)}>
          <View style={{ flexBasis: '50%', display: 'flex', flexDirection: 'column', height: '100%', marginRight: '24px' }}>
            {
              //  first column  }
            }

            <SpecsItem title={getText('ui-general-ui')} extraStyle={alignTextByLanguage(writeDirection)}>
              <View style={flexDirectionByLanguage(writeDirection, { display: 'flex' })}>
                <View
                  style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                    display: 'flex',
                    flexDirection: 'column',
                    flexBasis: '20%',
                  })}
                >
                  <SpecsItem title={getText('ui-general-cop')} extraStyle={{ borderBottom: 'none', fontSize: '10pt' }}>
                    <DesignRowInfoHigh style={{ width: '100%' }}>
                      <ComponentItem
                        title={cop.type ? getText(cop.type) : ' '}
                        subtitle={
                          (cop.finish ? generateFinish(cop.finish, cop.finishSapId) : ' ') +
                          (cop.copDisplay ? generateDisplayInfo(cop.copDisplay) : '')
                        }
                        thumbnail={viewImages.copImage ? viewImages.copImage.data : cop.image ? cop.image : emptyWallIcon}
                        imageSize={getImageDimensions(viewImages.copImage, cop.imageSize, 64, 400)}
                        extraStyle={{ width: '100%' }}
                        premiumIcon={premiumIcon}
                      />
                    </DesignRowInfoHigh>
                  </SpecsItem>
                </View>
                <View
                  style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                    display: 'flex',
                    flexDirection: 'column',
                    flexBasis: '80%',
                  })}
                >
                  <SignalizationFamily
                    title={cop.family ? getText(cop.family) : getText('ui-general-no-selection')}
                    desc={cop.familyDesc ? getText(cop.familyDesc) : getText('ui-general-no-selection')}
                    extraStyle={alignTextByLanguage(writeDirection)}
                  />
                  <View style={adjustPaddingByLanguage(writeDirection, 'right', '5px', { display: 'flex', flexDirection: 'row' })}>
                    <View
                      style={adjustPaddingByLanguage(writeDirection, 'left', '5px', {
                        display: 'flex',
                        flexDirection: 'column',
                        flexBasis: '50%',
                      })}
                    >
                      {horCop.type && (
                        <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                          <SpecsItem
                            title={getText('ui-signalization-horizontal')}
                            extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                          >
                            <DesignRowInfoHigh>
                              <SignalizationItem
                                title={horCop.type ? getText(horCop.type) + (horCop.finish ? ', ' + getText(horCop.finish) : '') : ' '}
                                thumbnail={
                                  viewImages.horizontalImage ? viewImages.horizontalImage.data : horCop.image ? horCop.image : emptyWallIcon
                                }
                                premiumIcon={premiumIcon}
                                imageSize={getImageDimensions(viewImages.horizontalImage, horCop.imageSize, 130, 45)}
                              />
                            </DesignRowInfoHigh>
                          </SpecsItem>
                        </View>
                      )}
                    </View>
                    <View
                      style={adjustPaddingByLanguage(writeDirection, 'left', '5px', {
                        display: 'flex',
                        flexDirection: 'column',
                        flexBasis: '50%',
                      })}
                    >
                      {(hl.type || lcs.type) && (
                        <>
                          {hi.type && hi.type !== undefined && (
                            <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                              <SpecsItem
                                title={getText('ui-general-hall-indicator')}
                                extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                              >
                                <DesignRowInfoHigh style={{ alignItems: 'flex-start' }}>
                                  <SignalizationItem
                                    title={hi.type ? getText(hi.type) : ' '}
                                    subtitle={hi.finish ? generateFinish(hi.finish, hi.finishSapId) : ''}
                                    thumbnail={viewImages.hiImage ? viewImages.hiImage.data : hi.image ? hi.image : emptyWallIcon}
                                    premiumIcon={premiumIcon}
                                    maxHeight={signalizationMaxImgHeight}
                                    imageSize={getImageDimensions(viewImages.hiImage, hi.imageSize, 130, 45)}
                                  />
                                </DesignRowInfoHigh>
                              </SpecsItem>
                            </View>
                          )}
                          {hl.type && hl.type !== undefined && (
                            <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                              <SpecsItem
                                title={
                                  SEPARATE_HALL_INDICATORS.includes(cop.familyId)
                                    ? getText('ui-general-hall-lantern')
                                    : getText('ui-general-hall-indicator')
                                }
                                extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                              >
                                <DesignRowInfoHigh>
                                  <SignalizationItem
                                    title={hl.type ? getText(hl.type) : ' '}
                                    subtitle={hl.finish ? generateFinish(hl.finish, hl.finishSapId) : ''}
                                    thumbnail={viewImages.hlImage ? viewImages.hlImage.data : hl.image ? hl.image : emptyWallIcon}
                                    premiumIcon={premiumIcon}
                                    maxHeight={signalizationMaxImgHeight}
                                    imageSize={getImageDimensions(viewImages.hlImage, hl.imageSize, 130, 45)}
                                  />
                                </DesignRowInfoHigh>
                              </SpecsItem>
                            </View>
                          )}
                          {lcs.type && lcs.type !== undefined && (
                            <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                              <SpecsItem
                                title={getText('ui-general-lcs')}
                                extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                              >
                                <DesignRowInfoHigh>
                                  <SignalizationItem
                                    title={lcs.type ? getText(lcs.type) : ' '}
                                    subtitle={lcs.finish ? generateFinish(lcs.finish, lcs.finishSapId) : ''}
                                    thumbnail={viewImages.lcsImage ? viewImages.lcsImage.data : lcs.image ? lcs.image : emptyWallIcon}
                                    premiumIcon={premiumIcon}
                                    maxHeight={signalizationMaxImgHeight}
                                    imageSize={getImageDimensions(viewImages.lcsImage, lcs.imageSize, 130, 45)}
                                  />
                                </DesignRowInfoHigh>
                              </SpecsItem>
                            </View>
                          )}
                          {fb.type && (
                            <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                              <SpecsItem
                                title={getText('ui-signalization-fb')}
                                extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                              >
                                <DesignRowInfoHigh>
                                  <SignalizationItem
                                    title={fb.type ? getText(fb.type) : ' '}
                                    thumbnail={fb.image ? fb.image : emptyWallIcon}
                                    premiumIcon={premiumIcon}
                                    maxHeight={signalizationMaxImgHeight}
                                    imageSize={getImageDimensions(viewImages.fbImage, fb.imageSize, 130, 45)}
                                  />
                                </DesignRowInfoHigh>
                              </SpecsItem>
                            </View>
                          )}
                          {lcs.shared ? (
                            <FinishName style={{ marginTop: '10px' }}>{getText('ui-lcs-position-shared')}</FinishName>
                          ) : (
                            <FinishName style={{ marginTop: '10px' }}>{getText('ui-lcs-position-elevator-specific')}</FinishName>
                          )}
                        </>
                      )}
                      {(eid.type || dop.type || din.type) && (
                        <>
                          {eid.type && !eid.type !== undefined && (
                            <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                              <SpecsItem
                                title={getText('ui-general-eid')}
                                extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                              >
                                <DesignRowInfoHigh>
                                  <SignalizationItem
                                    title={eid.type ? getText(eid.type) : ' '}
                                    subtitle={eid.finish ? generateFinish(eid.finish, eid.finishSapId) : ''}
                                    thumbnail={viewImages.eidImage ? viewImages.eidImage.data : eid.image ? eid.image : emptyWallIcon}
                                    premiumIcon={premiumIcon}
                                    maxHeight={signalizationMaxImgHeight}
                                    imageSize={getImageDimensions(viewImages.eidImage, eid.imageSize, 130, 45)}
                                  />
                                </DesignRowInfoHigh>
                              </SpecsItem>
                            </View>
                          )}
                          {din.type && !din.type !== undefined && (
                            <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                              <SpecsItem
                                title={getText('ui-general-din')}
                                extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                              >
                                <DesignRowInfoHigh>
                                  <SignalizationItem
                                    title={din.type ? getText(din.type) : ' '}
                                    subtitle={din.finish ? generateFinish(din.finish, din.finishSapId) : ''}
                                    thumbnail={viewImages.dinImage ? viewImages.dinImage.data : din.image ? din.image : emptyWallIcon}
                                    premiumIcon={premiumIcon}
                                    maxHeight={signalizationMaxImgHeight}
                                    imageSize={getImageDimensions(viewImages.dinImage, din.imageSize, 130, 45)}
                                  />
                                </DesignRowInfoHigh>
                              </SpecsItem>
                            </View>
                          )}
                          {dop.type && ( // may come empty from KTOC
                            <>
                              <View style={{ display: 'flex', flexDirection: 'column', flexBasis: signalizationBasisValue }}>
                                <SpecsItem
                                  title={getText('ui-general-dop')}
                                  extraStyle={{ borderBottom: 'none', fontSize: '10pt', paddingBottom: '0px' }}
                                >
                                  <DesignRowInfoHigh>
                                    <SignalizationItem
                                      title={dop.type ? getText(dop.type) : ' '}
                                      subtitle={dop.finish ? generateFinish(dop.finish, dop.finishSapId) : ''}
                                      thumbnail={viewImages.dopImage ? viewImages.dopImage.data : dop.image ? dop.image : emptyWallIcon}
                                      premiumIcon={premiumIcon}
                                      maxHeight={signalizationMaxImgHeight}
                                      imageSize={getImageDimensions(viewImages.dopImage, dop.imageSize, 130, 45)}
                                    />
                                  </DesignRowInfoHigh>
                                </SpecsItem>
                                {dop.shared ? (
                                  <FinishName style={{ marginTop: '10px' }}>{getText('ui-lcs-position-shared')}</FinishName>
                                ) : (
                                  <FinishName style={{ marginTop: '10px' }}>{getText('ui-lcs-position-elevator-specific')}</FinishName>
                                )}
                              </View>
                            </>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </SpecsItem>
          </View>
          {
            // Second column
          }
          <View style={{ flexBasis: '50%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <View style={{ display: 'flex', flexDirection: 'row' }}>
              <View
                style={adjustPaddingByLanguage(writeDirection, 'right', '15px', {
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                })}
              >
                <SpecsItem
                  title={getText('ui-general-car-accessories')}
                  extraStyle={alignTextByLanguage(writeDirection)}
                  style={{ marginBottom: '16px' }}
                >
                  <View style={flexDirectionByLanguage(writeDirection, { display: 'flex', flexDirection: 'row', flexWrap: 'wrap' })}>
                    {handrail.type && !!handrail.positionsStr && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          maxWidth: '100px',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-handrails')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                          debug={true}
                        >
                          <DesignRowInfo
                            style={
                              handrail.type && handrail.positionsStr ? { alignItems: 'flex-start', height:'100px' } : alignTextByLanguage(writeDirection)
                            }
                          >
                            <FinishItem
                              selected={handrail.type && handrail.positionsStr ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={handrail.type ? getText(handrail.type) : ''}
                              subtitle={
                                handrail.finish
                                  ? generateFinish(handrail.finish, handrail.sapId) + generatePositions(handrail.positionsStr)
                                  : ' '
                              }
                              sapId={handrail.sapId ? handrail.sapId : null}
                              thumbnail={handrail.compImage ? handrail.compImage : ' '}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}
                    {skirting.type && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-skirting')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo style={skirting.type ? { alignItems: 'flex-start', height:'100px' } : alignTextByLanguage(writeDirection)}>
                            <FinishItem
                              selected={skirting.type ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={null}
                              subtitle={skirting.finish ? generateFinish(skirting.finish, skirting.sapId) : ' '}
                              sapId={skirting.sapId ? skirting.sapId : null}
                              thumbnail={skirting.compImage ? skirting.compImage : ' '}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}
                    {bufferRail.type && !!bufferRail.positionsStr && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'right', '10px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-buffer-rail')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo
                            style={
                              bufferRail.type && bufferRail.positionsStr
                                ? { alignItems: 'flex-start', height:'100px' }
                                : alignTextByLanguage(writeDirection)
                            }
                          >
                            <FinishItem
                              selected={bufferRail.type && bufferRail.positionsStr ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={bufferRail.positionsStr ? arrToStr(bufferRail.positionsStr) : ''}
                              subtitle={bufferRail.finish ? generateFinish(bufferRail.finish, bufferRail.sapId) : ' '}
                              sapId={bufferRail.sapId ? bufferRail.sapId : null}
                              thumbnail={bufferRail.positions ? checkBufferIcon(bufferRail.positions) : ' '}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}

                   
                    {infoScreen.type && infoScreen.sapId !== 'LMS29S' && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-info-media-screen')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo style={infoScreen.type ? { alignItems: 'flex-start', height:'100px' } : alignTextByLanguage(writeDirection)}>
                            <FinishItem
                              selected={infoScreen.type ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={infoScreen.type ? getText(infoScreen.type) : ' '}
                              thumbnail={infoScreen.image ? infoScreen.image : ' '}
                              premiumIcon={premiumIcon}
                              imageWidth={'64px'}
                              imageHeight={null}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}

                    {infoScreen.type && infoScreen.sapId === 'LMS29S' && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'right', '5px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-info-media-screen')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo style={infoScreen.type ? { alignItems: 'flex-start', height:'100px' } : alignTextByLanguage(writeDirection)}>
                            <FinishItem
                              selected={infoScreen.type ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={
                                infoScreen.type
                                  ? getText(infoScreen.type) + (infoScreen.finish ? ', ' + getText(infoScreen.finish) : '')
                                  : ' '
                              }
                              thumbnail={infoScreen.image ? infoScreen.image : ' '}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}

                    {seat.type && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'right', '10px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-seat')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo style={seat.type ? { alignItems: 'flex-start', height:'100px' } : alignTextByLanguage(writeDirection)}>
                            <FinishItem
                              selected={seat.type ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={seat.type ? getText(seat.type) : ' '}
                              subtitle={seat.finish && seat.finishSapId ? generateFinish(seat.finish, seat.finishSapId) : ' '}
                              thumbnail={seat.image ? seat.image : ' '}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}

                    {mirror.type && !!mirror.positionsStr && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'left', '5px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-mirror')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo
                            style={mirror.type && mirror.positionsStr ? { alignItems: 'flex-start', height:'100px' } : alignTextByLanguage(writeDirection)}
                          >
                            <FinishItem
                              selected={mirror.type && mirror.positionsStr ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={mirror.positionsStr ? arrToStr(mirror.positionsStr) : ''}
                              subtitle={mirror.type ? getText(mirror.type) : ' '}
                              thumbnail={mirror.sapId ? checkMirrorIcon(mirror.sapId) : ' '}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}

                    {/*                   </View>
                  
                  <View style={ flexDirectionByLanguage(writeDirection,{display:'flex', flexDirection:'row'}) }> */}
                    {tenantDirectory.type && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'left', '5px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-tenant-directory')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo style={tenantDirectory.type ? { alignItems: 'flex-start', height:'100px' } : alignTextByLanguage(writeDirection)}>
                            <FinishItem
                              selected={tenantDirectory.type ? true : false}
                              noSelection={getText('ui-general-no-selection')}
                              title={tenantDirectory.type ? tenantDirectory.model + ', ' + tenantDirectory.size : ' '}
                              subtitle={tenantDirectory.type ? getText(tenantDirectory.finish) : ' '}
                              thumbnail={tenantDirectory.image ? tenantDirectory.image : ' '}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}

                    {digitalServices.includes(KCSM_AIR_PURIFIER) && (
                      <View
                        style={adjustPaddingByLanguage(writeDirection, 'left', '5px', {
                          display: 'flex',
                          flexDirection: 'column',
                          flexBasis: '25%',
                          paddingBottom: '1px',
                          marginRight: '24px',
                          marginBottom: '16px',
                        })}
                      >
                        <SpecsItem
                          title={getText('ui-general-air-purifier')}
                          extraStyle={{ ...alignTextByLanguage(writeDirection), borderBottom: 'none' }}
                        >
                          <DesignRowInfo style={{ alignItems: 'flex-start', height:'100px' }}>
                            <FinishItem
                              selected={true}
                              noSelection={getText('ui-general-no-selection')}
                              title={getText('ui-included')}
                              subtitle={' '}
                              thumbnail={imgAirPurifier}
                              imageWidth={'64px'}
                              imageHeight={null}
                              premiumIcon={premiumIcon}
                              addBasisValues={true}
                            />
                          </DesignRowInfo>
                        </SpecsItem>
                      </View>
                    )}
                  </View>
                </SpecsItem>
              </View>
            </View>
          </View>
        </DesignSection>
      </RegularPage>

      {
        // Digital services
      }
      {trueDigitalServices.length > 0 && (
        <RegularPage
          size='A4'
          orientation='landscape'
          style={
            documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1
              ? { fontFamily: 'ChinaFont' }
              : { fontFamily: 'KoneFont' }
          }
        >
          <SpecsHeader style={alignTextByLanguage(writeDirection)}>{getText('pdf-digital-services')}</SpecsHeader>
          <RegularSection>
            <View style={{ display: 'flex', flexDirection: 'column', height: '90%', width: '100%' }}>
              {trueDigitalServices.includes(KCSM_24_7_CONNECT) && (
                <View
                  style={alignItemsByLanguage(writeDirection, {
                    display: 'flex',
                    flexDirection: 'row',
                    flexBasis: '20%',
                    marginBottom: '10px',
                  })}
                >
                  <Image src={img247Services} style={{ flexBasis: '20%', width: '150px', objectFit: 'contain' }} />
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'left', '20px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '80%',
                      marginBottom: '10px',
                    })}
                  >
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '16pt', color: '#000000', marginBottom: '8px' })}>
                      {getText('ui-24-7-connected-services-complete-term')}
                    </Text>
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#000000' })}>
                      {getText('ui-24-7-connected-services-general-info')}
                    </Text>
                    {digitalServicesUrls[KCSM_24_7_CONNECT] && (
                      <Link src={digitalServicesUrls[KCSM_24_7_CONNECT]}>
                        <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#0071B9', paddingTop: '10px' })}>
                          {getText('ui-general-read-more')}
                        </Text>
                      </Link>
                    )}
                  </View>
                </View>
              )}

              {trueDigitalServices.includes(KCSM_KONE_INFORMATION) && (
                <View
                  style={alignItemsByLanguage(writeDirection, {
                    display: 'flex',
                    flexDirection: 'row',
                    flexBasis: '20%',
                    marginBottom: '10px',
                  })}
                >
                  <Image src={imgKoneInformation} style={{ flexBasis: '20%', width: '150px', objectFit: 'contain' }} />
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'left', '20px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '80%',
                    })}
                  >
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '16pt', color: '#000000', marginBottom: '8px' })}>
                      {getText('ui-general-kone-information')}
                    </Text>
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#000000' })}>
                      {getText('ui-general-kone-information-general-info')}
                    </Text>
                    {digitalServicesUrls[KCSM_KONE_INFORMATION] && (
                      <Link src={digitalServicesUrls[KCSM_KONE_INFORMATION]}>
                        <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#0071B9', paddingTop: '10px' })}>
                          {getText('ui-general-read-more')}
                        </Text>
                      </Link>
                    )}
                  </View>
                </View>
              )}

              {trueDigitalServices.includes(KCSM_ELEV_MUSIC) && (
                <View
                  style={alignItemsByLanguage(writeDirection, {
                    display: 'flex',
                    flexDirection: 'row',
                    flexBasis: '20%',
                    marginBottom: '10px',
                  })}
                >
                  <Image src={imgElevatorMusic} style={{ flexBasis: '20%', width: '150px', objectFit: 'contain' }} />
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'left', '20px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '80%',
                    })}
                  >
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '16pt', color: '#000000', marginBottom: '8px' })}>
                      {getText('ui-elevator-music-heading')}
                    </Text>
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#000000' })}>
                      {getText('ui-elevator-music-general-info')}
                    </Text>
                    {digitalServicesUrls[KCSM_ELEV_MUSIC] && (
                      <Link src={digitalServicesUrls[KCSM_ELEV_MUSIC]}>
                        <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#0071B9', paddingTop: '10px' })}>
                          {getText('ui-general-read-more')}
                        </Text>
                      </Link>
                    )}
                  </View>
                </View>
              )}

              {trueDigitalServices.includes(KCSM_MOBILE_ELEV_CALL) && (
                <View
                  style={alignItemsByLanguage(writeDirection, {
                    display: 'flex',
                    flexDirection: 'row',
                    flexBasis: '20%',
                    marginBottom: '10px',
                  })}
                >
                  <Image src={imgElevatorCall} style={{ flexBasis: '20%', width: '150px', objectFit: 'contain' }} />
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'left', '20px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '80%',
                    })}
                  >
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '16pt', color: '#000000', marginBottom: '8px' })}>
                      {getText('ui-elevator-call-heading')}
                    </Text>
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#000000' })}>
                      {getText('ui-elevator-call-general-info')}
                    </Text>
                    {digitalServicesUrls[KCSM_MOBILE_ELEV_CALL] && (
                      <Link src={digitalServicesUrls[KCSM_MOBILE_ELEV_CALL]}>
                        <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#0071B9', paddingTop: '10px' })}>
                          {getText('ui-general-read-more')}
                        </Text>
                      </Link>
                    )}
                  </View>
                </View>
              )}

              {trueDigitalServices.includes(KCSM_APF_SERV_ROBOT_API) && (
                <View
                  style={alignItemsByLanguage(writeDirection, {
                    display: 'flex',
                    flexDirection: 'row',
                    flexBasis: '20%',
                    marginBottom: '10px',
                  })}
                >
                  <Image src={imgRobotApi} style={{ flexBasis: '20%', width: '150px', objectFit: 'contain' }} />
                  <View
                    style={adjustPaddingByLanguage(writeDirection, 'left', '20px', {
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '80%',
                    })}
                  >
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '16pt', color: '#000000', marginBottom: '8px' })}>
                      {getText('ui-robot-api-heading')}
                    </Text>
                    <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#000000' })}>
                      {getText('ui-robot-api-general-info')}
                    </Text>
                    {digitalServicesUrls[KCSM_APF_SERV_ROBOT_API] && (
                      <Link src={digitalServicesUrls[KCSM_APF_SERV_ROBOT_API]}>
                        <Text style={alignTextByLanguage(writeDirection, { fontSize: '10pt', color: '#0071B9', paddingTop: '10px' })}>
                          {getText('ui-general-read-more')}
                        </Text>
                      </Link>
                    )}
                  </View>
                </View>
              )}
            </View>
          </RegularSection>
        </RegularPage>
      )}

      {
        // car views
      }
      <RegularPage
        size='A4'
        orientation='landscape'
        style={
          documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1
            ? { fontFamily: 'ChinaFont' }
            : { fontFamily: 'KoneFont' }
        }
      >
        <RegularSection>
          <CarImageRow style={flexDirectionByLanguage(writeDirection)}>
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexBasis: '40%' }}>
              <Image
                src={
                  viewImages[galleryAngleImage] && viewImages[galleryAngleImage].data ? viewImages[galleryAngleImage].data : emptyWallIcon
                }
                style={{ padding: '10px', paddingTop: '30px', height: '480px', objectFit: 'contain' }}
              />
              <Text style={alignItemsByLanguage(writeDirection, { fontSize: '12pt', color: '#939598' })}>
                {getText('pdf-wall-a-full-term')}, {galleryAngleImage === 'angleBack' ?getText('pdf-wall-d-full-term') : getText('pdf-wall-b-full-term')}
              </Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexBasis: '30%' }}>
              <Image
                src={viewImages.front && viewImages.front.data ? viewImages.front.data : emptyWallIcon}
                style={{ padding: '10px', paddingTop: '30px', height: '480px', objectFit: 'contain' }}
              />
              <Text style={alignItemsByLanguage(writeDirection, { fontSize: '12pt', color: '#939598' })}>
                {getText('pdf-wall-c-full-term')}
              </Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexBasis: '30%' }}>
              <Image
                src={viewImages.back && viewImages.back.data ? viewImages.back.data : emptyWallIcon}
                style={{ padding: '10px', paddingTop: '30px', height: '480x', objectFit: 'contain' }}
              />
              <Text style={alignItemsByLanguage(writeDirection, { fontSize: '12pt', color: '#939598' })}>
                {getText('pdf-wall-a-full-term')}
              </Text>
            </View>
          </CarImageRow>
        </RegularSection>
      </RegularPage>

      <FullPage
        size='A4'
        orientation='landscape'
        style={
          documentLanguage && documentLanguage.code && documentLanguage.code.indexOf('zh') !== -1
            ? { fontFamily: 'ChinaFont' }
            : { fontFamily: 'KoneFont' }
        }
      >
        <BackCoverSection style={alignItemsByLanguage(writeDirection)}>
          <LastPageNotes>
            {!!getText('pdf-notes-1') && <KoneNotes style={alignTextByLanguage(writeDirection)}>{getText('pdf-notes-1')}</KoneNotes>}

            {!!getText('pdf-notes-2') && <KoneNotes style={alignTextByLanguage(writeDirection)}>{getText('pdf-notes-2')}</KoneNotes>}

            {!!getText('pdf-notes-3') && <KoneNotes style={alignTextByLanguage(writeDirection)}>{getText('pdf-notes-3')}</KoneNotes>}

            {!!getText('pdf-notes-4') && <KoneNotes style={alignTextByLanguage(writeDirection)}>{getText('pdf-notes-4')}</KoneNotes>}
          </LastPageNotes>
          <GenerateAddresses
            textAlignStyle={alignTextByLanguage(writeDirection)}
            flexAlignStyle={flexDirectionByLanguage(writeDirection)}
            addresses={addresses}
          />
          <LegalNotes>
            <ContactText>{getText('pdf-document-was-created')}</ContactText>
            <ContactUrl
              style={{ color: '#007DC5', textDecoration: 'none' }}
              src={
                window.location.protocol +
                '//' +
                window.location.hostname +
                (window.location.port !== 80 && window.location.port !== 443 ? ':' + window.location.port : '')
              }
            >
              {window.location.hostname}
            </ContactUrl>
            <LegalNotestext>{getText('ui-landing-disclaimer')}</LegalNotestext>
          </LegalNotes>
        </BackCoverSection>
        {writeDirection === 'rtl' ? <SloganImageRTL src={slogan ? slogan : null} /> : <SloganImage src={slogan ? slogan : null} />}
      </FullPage>
    </Document>
  );
};

export default PdfGenerator;

const flexDirectionByLanguage = (dir, otherStyles = {}) => {
  return dir === 'rtl' ? { ...otherStyles, flexDirection: 'row-reverse' } : { ...otherStyles, flexDirection: 'row' };
};

const alignTextByLanguage = (dir, otherStyles = {}) => {
  return dir === 'rtl' ? { ...otherStyles, textAlign: 'right' } : { ...otherStyles, textAlign: 'left' };
};

const alignItemsByLanguage = (dir, otherStyles = {}) => {
  return dir === 'rtl' ? { ...otherStyles, alignItems: 'flex-end' } : { ...otherStyles, alignItems: 'flex-start' };
};

const alignContentByLanguage = (dir, otherStyles = {}) => {
  return dir === 'rtl' ? { ...otherStyles, alignContent: 'right' } : { ...otherStyles, alignContent: 'left' };
};

const adjustPaddingByLanguage = (dir, side, value, otherStyles = {}) => {
  if (side === 'left') {
    return dir === 'rtl' ? { ...otherStyles, paddingRight: value } : { ...otherStyles, paddingLeft: value };
  }
  return dir === 'rtl' ? { ...otherStyles, paddingLeft: value } : { ...otherStyles, paddingRight: value };
};

const HeaderCarInfo = ({ title, info, extraStyle }) => {
  return (
    <HeaderCarSpecsItem style={extraStyle}>
      <HeaderCarSpecsTitle>{title}</HeaderCarSpecsTitle>
      <HeaderCarSpecsInfo>{info}</HeaderCarSpecsInfo>
    </HeaderCarSpecsItem>
  );
};

const HeaderKTOCInfo = ({ title, info, extraStyle }) => {
  return (
    <HeaderCarSpecsItem style={{ ...extraStyle }}>
      <HeaderInfoTitle>{title}</HeaderInfoTitle>
      <HeaderInfoContent>{info}</HeaderInfoContent>
    </HeaderCarSpecsItem>
  );
};

const HeaderKeySpecsItem = ({ dirStyle, image, text, scdLine }) => {
  return (
    <View style={{ ...dirStyle, display: 'flex', alignItems: 'center' }}>
      <View>{image && <Image src={image} style={{ height: '62px' }} />}</View>
      <View style={{ display: 'flex', flexDirection: 'column' }}>
        <Text style={{ width: '100%', fontSize: '10pt', color: '#007DC5' }}>{text}</Text>
        {scdLine && <Text style={{ fontSize: '10pt', color: '#007DC5' }}>{scdLine}</Text>}
      </View>
    </View>
  );
};


const SpecsItem = ({ children, title, extraStyle = {} }) => {
  return (
    <>
      <DesignDefinition style={extraStyle}>{title}</DesignDefinition>
      {children}
    </>
  );
};

const FinishItem = ({
  selected = true,
  title,
  subtitle,
  thumbnail,
  premium,
  noSelection,
  imageHeight = '85px',
  imageWidth = '70px',
  extraStyle = {},
  premiumIcon,
  addBasisValues = false,
}) => {
  let thbImage = thumbnail;
  if (Array.isArray(thumbnail)) {
    thbImage = thumbnail[0];
  }

  return (
    <>
      {selected ? (
        addBasisValues ? (
          <>
            {!!thbImage && (
              <FinishImage
                src={thbImage}
                style={
                  imageHeight
                  ? {
                    width: imageWidth,
                    height: imageHeight,
                    objectFit: 'fill',
                    maxWidth: '376px',
                    maxHeight: '400px',
                    flexBasis: '63%',
                    }
                  : {
                    width: imageWidth,
                    objectFit: 'contain',
                    maxWidth: '376px',
                    maxHeight: '400px',
                    flexBasis: '63%',
                    }
                }
              />
            )}
            {!!premium && <PremiumImage src={premiumIcon} />}
            {!!title && <FinishName style={{ ...extraStyle, flexBasis: '22%' }}>{title}</FinishName>}
            {!!subtitle && <FinishName style={{ ...extraStyle, flexBasis: '50%' }}>{subtitle}</FinishName>}
          </>
        ) : (
          <>
            {!!thbImage && (
              <FinishImage
                src={thbImage}
                style={{ width: imageWidth, height: imageHeight, objectFit: 'fill', maxWidth: '376px', maxHeight: '400px' }}
              />
            )}
            {!!premium && <PremiumImage src={premiumIcon} />}
            {!!title && <FinishName style={{ ...extraStyle }}>{title}</FinishName>}
            {!!subtitle && <FinishName style={{ ...extraStyle }}>{subtitle}</FinishName>}
          </>
        )
      ) : (
        <>
          <FinishName style={{ ...extraStyle }}>{noSelection}</FinishName>
        </>
      )}
    </>
  );
};

const ComponentItem = ({
  selected = true,
  title,
  subtitle,
  thumbnail,
  premium,
  noSelection,
  imageSize = ['64px', '440px'],
  extraStyle = {},
  premiumIcon,
  addBasisValues = false,
}) => {
  let thbImage = thumbnail;
  if (Array.isArray(thumbnail)) {
    thbImage = thumbnail[0];
  }

  return (
    <>
      {selected ? (
        addBasisValues ? (
          <>
            {!!thbImage && <FinishImage src={thbImage} style={{ width: imageSize[0], height: imageSize[1], flexBasis: '60%' }} />}
            {!!premium && <PremiumImage src={premiumIcon} />}
            {!!title && <FinishName style={{ ...extraStyle, flexBasis: '12%' }}>{title}</FinishName>}
            {!!subtitle && <FinishName style={{ ...extraStyle, flexBasis: '28%' }}>{subtitle}</FinishName>}
          </>
        ) : (
          <>
            {!!thbImage && <FinishImage src={thbImage} style={{ width: imageSize[0], height: imageSize[1] }} />}
            {!!premium && <PremiumImage src={premiumIcon} />}
            {!!title && <FinishName style={{ ...extraStyle }}>{title}</FinishName>}
            {!!subtitle && <FinishName style={{ ...extraStyle }}>{subtitle}</FinishName>}
          </>
        )
      ) : (
        <>
          <FinishName style={{ ...extraStyle }}>{noSelection}</FinishName>
        </>
      )}
    </>
  );
};

const SignalizationItem = ({
  selected = true,
  title,
  subtitle,
  thumbnail,
  premium,
  noSelection,
  imageSize = ['200px', '50px'],
  extraStyle = {},
  premiumIcon,
  maxHeight = '100px',
}) => {
  let thbImage = thumbnail;
  if (Array.isArray(thumbnail)) {
    thbImage = thumbnail[0];
  }

  return (
    <>
      {selected ? (
        <>
          {!!thbImage && <FinishImage src={thbImage} style={{ width: imageSize[0], height: imageSize[1], flexBasis: '63%' }} />}
          {!!premium && <PremiumImage src={premiumIcon} />}
          {!!title && <FinishName style={{ ...extraStyle, flexBasis: '12%' }}>{title}</FinishName>}
          {!!subtitle && <FinishName style={{ ...extraStyle, flexBasis: '25%' }}>{subtitle}</FinishName>}
        </>
      ) : (
        <>
          <FinishName style={{ ...extraStyle }}>{noSelection}</FinishName>
        </>
      )}
    </>
  );
};

const SignalizationFamily = ({ title, desc, extraStyle = {} }) => {
  return (
    <>
      <Text style={{ ...extraStyle, fontSize: '16pt', color: '#000000', marginBottom: '8px', marginTop: '8px' }}>{title}</Text>
      <Text style={{ ...extraStyle, fontSize: '10pt', color: '#000000', marginBottom: '15px' }}>{desc}</Text>
    </>
  );
};

const GenerateAddresses = ({ textAlignStyle, flexAlignStyle, addresses }) => {
  let addressPrintout;
  if (!Array.isArray(addresses)) {
    addressPrintout = (
      <>
        {addresses.officeName && <ContactHeader style={{ ...textAlignStyle }}>{addresses.officeName}</ContactHeader>}
        {addresses.officeAddress && <ContactText style={{ ...textAlignStyle }}>{addresses.officeAddress}</ContactText>}
        {addresses.officePhone && <ContactText style={{ ...textAlignStyle }}>{addresses.officePhone}</ContactText>}
        {addresses.officeUrl && (
          <ContactUrl style={{ ...textAlignStyle, paddingTop: '10px', paddingBottom: '10px' }}>{addresses.officeUrl}</ContactUrl>
        )}
      </>
    );
  } else {
    addressPrintout = (
      <View style={{ display: 'flex', ...flexAlignStyle }}>
        {addresses.map((address, index) => {
          return (
            <View key={index} style={{ display: 'flex', flexDirection: 'column', flexBasis: '20%' }}>
              {address.officeName && <ContactHeader style={{ ...textAlignStyle }}>{address.officeName}</ContactHeader>}
              {address.officeAddress && <ContactText style={{ ...textAlignStyle }}>{address.officeAddress}</ContactText>}
              {address.officePhone && <ContactText style={{ ...textAlignStyle }}>{address.officePhone}</ContactText>}
              {address.officeUrl && (
                <ContactUrl style={{ ...textAlignStyle, paddingTop: '10px', paddingBottom: '10px' }}>{address.officeUrl}</ContactUrl>
              )}
            </View>
          );
        })}
      </View>
    );
  }
  return <>{addressPrintout}</>;
};
