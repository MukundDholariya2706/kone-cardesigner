import './ElevatorMusic.scss';
import React, { useContext, useState, useEffect } from 'react';

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import EditorLayout from '../EditorLayout';
import SwitchButton from '../SwitchButton';
import ElevatorMusicDialog from './dialogs/ElevatorMusicDialog';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import { EDIT_VIEW_DIGITAL_SERVICES, KCSM_ELEV_MUSIC } from '../../constants';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';

import imgElevatorMusic from "../../assets/images/elevator-music.png";
import Icon from '../Icon';

const ElevatorMusic = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView, showDialogElevatorMusic, setShowDialogElevatorMusic } = useContext(LayoutContext);
  const { product } = useContext(ProductContext);
  const {  setService } = useContext(DesignContext);

  const [ toggle, setToggle ] = useState(true)
  
  const [ selectedMusicSample, setSelectedMusicSample ] = useState({})
  const [ elementAudio, setElementAudio ] = useState(null)
  const [ musicCurrentTime, setMusicCurrentTime ] = useState('')
  const [ musicDuration, setMusicDuration ] = useState('')
  const [ musicPlaying, setMusicPlaying ] = useState(false)
  const [disableRemove, setDisableRemove] = useState([])


  const musicSamples = [
    {type:'ui-elevator-music-sample-pop', sample:'/music-samples/sample_pop.mp3', label:'ui-elevator-music-sample-pop-title'},
    {type:'ui-elevator-music-sample-rock', sample:'/music-samples/sample_rock.mp3', label:'ui-elevator-music-sample-rock-title'},
    {type:'ui-elevator-music-sample-indie-pop', sample:'/music-samples/sample_indie_pop.mp3', label:'ui-elevator-music-sample-indie-pop-title'},
    {type:'ui-elevator-music-sample-lounge', sample:'/music-samples/sample_lounge.mp3', label:'ui-elevator-music-sample-lounge-title'},
    {type:'ui-elevator-music-sample-ambient', sample:'/music-samples/sample_ambient.mp3', label:'ui-elevator-music-sample-ambient-title'},
    {type:'ui-elevator-music-sample-electronic', sample:'/music-samples/sample_electronic.mp3', label:'ui-elevator-music-sample-electronic-title'},
    {type:'ui-elevator-music-sample-soundtrack', sample:'/music-samples/sample_soundtrack.mp3', label:'ui-elevator-music-sample-soundtrack-title'},
    {type:'ui-elevator-music-sample-classic', sample:'/music-samples/sample_classical.mp3', label:'ui-elevator-music-sample-classic-title'},
  ]

  const update = () => {

  }

  const convertToTime = (secs) => {
    if(!secs) return '0:00'
    const minutes = Math.floor(secs / 60)
    const seconds = Math.floor( secs%60 )
    return minutes+':'+(seconds<10 ?'0'+seconds :seconds)
  }

  // on component mount
  useEffect(() => {
    setService({type:KCSM_ELEV_MUSIC,value:true})
    setSelectedMusicSample(musicSamples[0])
    setElementAudio(document.getElementById('musicSample'))
  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    if(!selectedMusicSample.sample) return  

    elementAudio.src = selectedMusicSample.sample
    setMusicCurrentTime(convertToTime(elementAudio.currentTime))
    document.getElementById('progress').style.width = '0px'
    setMusicDuration('')
    musicPlaying ?elementAudio.play() :elementAudio.pause()
    
    elementAudio.onloadedmetadata = () => {
      console.log(elementAudio)
      setMusicDuration(convertToTime(elementAudio.duration))
    }
    elementAudio.ontimeupdate = () => {
      setMusicCurrentTime(convertToTime(elementAudio.currentTime))
      document.getElementById('progress').style.width = ((elementAudio.currentTime / elementAudio.duration) * 100)+'%'
    }
    elementAudio.onended = () => {
      elementAudio.currentTime = 0
      setMusicPlaying(false)
    }

  }, [selectedMusicSample])

  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      setService({type:KCSM_ELEV_MUSIC,value:true})
    } else {
      setService({type:KCSM_ELEV_MUSIC,value:false})
    }

  }, [toggle])

  const onBackClick = () => {
    setEditView(EDIT_VIEW_DIGITAL_SERVICES)
  }
  
  const onClickPlayHandler = () => {
    if(musicPlaying) {
      elementAudio.pause()
      setMusicPlaying(false)
    } else {
      elementAudio.play()
      setMusicPlaying(true)
    }
  }

  return (      
    <div className="ElevatorMusic">        
      <EditorLayout heading={getText('ui-elevator-music-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
            <SwitchButton toggle={toggle} label={getText('ui-elevator-music-add')} onChange={e => setToggle(e)} isDisabled={(disableRemove.indexOf(KCSM_ELEV_MUSIC)!==-1)} extraStyle={{textTransform:'unset'}} />

            <div className='info-content'>
              <img
                    className="image"
                    src={imgElevatorMusic}
                    alt=""
                  />
            </div>

            <div className='info-heading'>
              {getText('ui-elevator-music-info-heading')}
            </div>
            <div className='info-content'>
              <ul>
                <li>{getText('ui-elevator-music-fact-1')}</li>
                <li>{getText('ui-elevator-music-fact-2')}</li>
                <li>{getText('ui-elevator-music-fact-3')}</li>
                <li>{getText('ui-elevator-music-fact-4')}</li>
                <li>{getText('ui-elevator-music-fact-5')}</li>
                <li>{getText('ui-elevator-music-fact-6')}</li>
                <li>{getText('ui-elevator-music-fact-7')}</li>
              </ul>

              <p className="read-more" onClick={() => setShowDialogElevatorMusic(true)}>
                { getText('ui-general-read-more')}
              </p>
            </div>

            <HeadingComponent className="category-heading" heading={getText('ui-try-musical-themes')} padding="sm" border="top" headingStyle={ {textTransform:'none', paddingBottom:'10px'} } />
            <div className='music-sample-container'> 
              {musicSamples.map((item, index)=> {
                return (
                  <div key={index} className={'music-sample' + ((item.sample === selectedMusicSample?.sample) ?' selected' :'')} onClick={() => setSelectedMusicSample(item)}>
                    {getText(item.type)}
                  </div>
                )
                
              })}
            </div>
            <div className='music-player'>
              <audio id="musicSample"/>
              <div className='music-info'>
                <div className='music-time'>{musicCurrentTime}</div>
                <div className='music-play' onClick={() => onClickPlayHandler()}>
                  <Icon className='music-control' id={musicPlaying ?'icon-pause' :'icon-play'} />
                </div>
                <div className='music-time'>{musicDuration}</div>
              </div>
              <div className='music-progress-total'>
                <div className='music-progress-now' id='progress'/>
              </div>
              <div className='music-title'>{(elementAudio && elementAudio?.title !== '') ? elementAudio.title :getText(selectedMusicSample?.label)}</div>              
            </div>
          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
      { showDialogElevatorMusic && 
        <ElevatorMusicDialog onConfirm={() => setShowDialogElevatorMusic(false)} onCancel={() => setShowDialogElevatorMusic(false)} />
      }
    </div>
  )
}
export default ElevatorMusic;