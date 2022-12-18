import { Grid } from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { Button } from '@material-ui/core';
import { Avatar } from '@mui/material';
import './Call.css';
import CallWindow from './CallWindow';
import {callUser, joinCall} from '../Utils';


// callTo, callFrom, currentUser, otherUser, callType, roomId (if u r first to activate the call...it wil be null)
function PreCall({data}) {
    const [callType, setCallType] = useState(data.callType);
    const [callStarted, setCallStarted] = useState(false);    
    const [currVidStream, setStream] = useState();

    const vidRef = useRef();
    useEffect(() => {
        if(callType !== "VOICE") {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if(vidRef.current) {
                    vidRef.current.srcObject = currentStream;
                }
            });
        } else if(currVidStream) {
            currVidStream.getTracks().forEach(track => {
                if(track)
                    track.stop();
            });
        }
    }, [callType]);

    const callTheUser = () => {
        setCallStarted(true);
        callUser({...data, callType});
    }

    const joinTheCall = () => {
        setCallStarted(true);
        joinCall(data);
    }

  return (
    <>
        {!callStarted ? 
    <Grid container className='p-5 pre-call-main-container'>
             
                <Grid xs={7} className='p-1 h-100'>
                    <div className='h-100 bg-primary m-3' style={{position : 'relative'}}>
                        <div className='h-100 d-flex flex-column align-items-center justify-content-center'>
                            { callType === "VOICE" ? 
                                <><VideocamOffIcon/>Camera off</> : 
                                <>
                                    <video playsInline muted autoPlay ref={vidRef}></video>
                                </>   
                            }
                        </div>
                        <div className='d-flex w-100 justify-content-center align-items-center'  style={{position : 'absolute', bottom: '1em'}}>
                            <div className='m-2' role="button">{ callType === "VOICE" ? 
                                <VideocamOffIcon onClick={() => setCallType("VIDEO")}/>: 
                                <VideocamIcon onClick={() => setCallType("VOICE")}/>
                            }</div>
                            <div className='m-2' role="button"><MicIcon/></div>
                        </div>
                    </div>
                </Grid>
                <Grid xs={5} className='p-1' spacing={10}>
                    <div className='d-flex flex-column align-items-center justify-content-center h-100 bg-secondary m-3'>
                        <Avatar alt={data.otherUser.displayName} src={data.otherUser.imgUrl}
                                sx={{ width: 100, height: 100 }}/>
                        <h4>{data.otherUser.displayName}</h4>
                        {data.callTo ? <>
                            <span>Ready to call ?</span>
                            <Button onClick={() => callTheUser()}>Start call</Button>
                        </> : <>
                            <span>Ready to join ?</span>
                            <Button onClick={() => joinTheCall()}>Join call</Button>
                        </>}
                    </div>
                </Grid> 
            
            </Grid>
            : 
            <>
                <CallWindow callData={data} micOn={true} vidOn={callType === "VIDEO"} callStarter={data.roomOwner} currentUserVidStream={currVidStream}/>
            </>
        }
        </>
  )
}

export default PreCall;