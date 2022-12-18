import React from 'react'
import { useRef } from 'react';
import { useState, useEffect } from 'react';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import './Call.css';
import { Avatar } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { getRoomInfo } from '../Utils';



function CallWindow({callData, micOn, vidOn, callStarter, currentUserVidStream}) {
  const [callStarted, setCallStarted] = useState(callStarter);
  const [videoSettingOn, setVideoSettingOn] = useState(vidOn);
  const [currVidStream, setStream] = useState(currentUserVidStream);
  const [inRoomData, setInRoomData] = useState();

  const [micSettingOn, setMicSettingOn] = useState(micOn);
  
  const selfVideoRef = useRef();
  useEffect(() => {
    setTimeout(() => {
        if(videoSettingOn && currVidStream) {
            if(selfVideoRef?.current){
                selfVideoRef.current.srcObject = currVidStream;
            }
        }
    }, 3000);
    getRoomInfo(callStarter, setInRoomData);
  }, []);

  const setVideo = (onOrOff) => {
    setVideoSettingOn(onOrOff);
    if(!onOrOff && currVidStream) {
        currVidStream.getTracks().forEach(track => {
            if(track)
                track.stop();
        });
        setStream(undefined);
    }
    if(onOrOff && !currVidStream) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
            setStream(currentStream);
            if(selfVideoRef.current) {
                selfVideoRef.current.srcObject = currentStream;
            }
        });
    }
  }

  return (
    <div className='position-relative' style={{height: '100vh'}}>
        Whose room ? {callStarter}
        {callStarter && inRoomData?.length === 1 && <div className='w-100 h-100 d-flex justify-content-center flex-column align-items-center'> 
            <Avatar sx={{width: 100, height: 100}}  alt={callData.otherUser.displayName} src={callData.otherUser.imgUrl}/>
            <h6 className='mt-2'>calling... {callData.otherUser.displayName}</h6>
        </div>}

        {
            inRoomData?.length > 1 &&  inRoomData.map(attendee => (<div>{attendee}</div>))
        }
        
        <div className='users-vid'>
            {
                videoSettingOn ? 
                    <video className='w-100 h-100' playsInline muted autoPlay ref={selfVideoRef}></video> : 
                    <Avatar sx={{width: 100, height: 100}}  alt={callData.currentUser.displayName} src={callData.currentUser.imgUrl}/>
            }
        </div>
        <div className='position-absolute w-100 button-container'>
            <div className='d-flex justify-content-center align-items-center'>
                <div className='p-2'>
                    {
                        videoSettingOn ? 
                            <VideocamIcon role="button" onClick={() => setVideo(false)}/>: 
                            <VideocamOffIcon role="button" onClick={() => setVideo(true)}/>
                    }
                </div>
                <div className='p-2'>
                    {
                        micOn ? 
                            <MicIcon role="button"/> :
                            <MicOffIcon role="button"/>
                    }
                </div>
                <div className='p-2'>
                    <CallEndIcon role="button"/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CallWindow;