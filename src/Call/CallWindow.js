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
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { getRoomInfo, getAllFollowing, addUserToCall } from '../Utils';
import {getModalStyle, useStyles} from '../stylesUtil.js';
import { Modal } from '@material-ui/core';
import UserLists from '../UserLists/UserLists';
import styled from "styled-components";
import io from "socket.io-client";
import Peer from "simple-peer";
import micmute from "../assets/micmute.svg";
import micunmute from "../assets/micunmute.svg";
import webcam from "../assets/webcam.svg";
import webcamoff from "../assets/webcamoff.svg";



const Container = styled.div`
  height: 100vh;
  width: 20%;
`;

const Controls = styled.div`
  margin: 3px;
  padding: 5px;
  height: 27px;
  width: 98%;
  background-color: rgba(255, 226, 104, 0.1);
  margin-top: -8.5vh;
  filter: brightness(1);
  z-index: 1;
  border-radius: 6px;
`;

const ControlSmall = styled.div`
  margin: 3px;
  padding: 5px;
  height: 16px;
  width: 98%;
  margin-top: -6vh;
  filter: brightness(1);
  z-index: 1;
  border-radius: 6px;
  display: flex;
  justify-content: center;
`;

const ImgComponent = styled.img`
  cursor: pointer;
  height: 25px;
`;

const ImgComponentSmall = styled.img`
  height: 15px;
  text-align: left;
  opacity: 0.5;
`;

const StyledVideo = styled.video`
  width: 100%;
  position: static;
  border-radius: 10px;
  overflow: hidden;
  margin: 1px;
  border: 5px solid gray;
`;

const Video = (props) => {
    const ref = useRef();
  
    useEffect(() => {
      props.peer.on("stream", (stream) => {
        ref.current.srcObject = stream;
        console.log("Adding stream  ::", stream);
      });
      if(props.othStream && props.id && props.othStream[props.id]) {
        ref.current.srcObject = props.othStream[props.id];
      }
    }, [props]);
  
    return <StyledVideo playsInline autoPlay ref={ref} />;
};
  

function CallWindow({callData, micOn, vidOn, callStarter, currentUserVidStream}) {
  const [callStarted, setCallStarted] = useState(callStarter);
  const [testBool, setTestBool] = useState(true);
  const [videoSettingOn, setVideoSettingOn] = useState(vidOn);
  const [currVidStream, setStream] = useState(currentUserVidStream);
  const [inRoomData, setInRoomData] = useState();
  const [currentRoomID, setCurrRoomID] = useState();
  const [followingUsers, setFollowingUsers] = useState();   // you can only add people whom you follow
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const classes = useStyles();

  const [micSettingOn, setMicSettingOn] = useState(micOn);

  // socket variables
  const [peers, setPeers] = useState([]);
  const [audioFlag, setAudioFlag] = useState(true);
  const [videoFlag, setVideoFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const [otherStreans, setOtherStreams] = useState();
//   const [roomID, setRoomId] = useState();
  const socketRef = useRef();
  const userVideo = useRef();
  const inptRef = useRef();

  const peersRef = useRef([]);
  
  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 2,
  };
  
  const selfVideoRef = useRef();
  useEffect(() => {
    socketRef.current = io.connect("http://localhost:5000");
    // setTimeout(() => {
    //     if(videoSettingOn && currVidStream) {
    //         if(selfVideoRef?.current){
    //             selfVideoRef.current.srcObject = currVidStream;
    //         }
    //     }
    // }, 3000);
    getRoomInfo(callStarter, setInRoomData, setCurrRoomID);
    getAllFollowing(callData?.currentUser?.uid).then((val) => {
        setFollowingUsers({userIdList : val.filter(id => id !== callData.otherUser.uid )});
    });
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

  const addUser = (user) => {
    addUserToCall(callStarter, currentRoomID.roomID, callData.currentUser.uid, user);
  }

  // 1- method to start users camera
  function createStream() {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        if(testBool) {
          setTestBool(false);
          // 2- set currentUsers video stream in <video> 
          selfVideoRef.current.srcObject = stream;
  
          // 3- emit roomID, with user who joined
          socketRef.current.emit("join room", currentRoomID.roomID);
  
          // 4- in server.js
  
          // 5- listen to all users in current call
          socketRef.current.on("all users", (users) => {
            console.log(users)
            const peers = [];
            users.forEach((userID) => {
              const peer = createPeer(userID, socketRef.current.id, stream);
              peersRef.current.push({
                peerID: userID,
                peer,
              });
              peers.push({
                peerID: userID,
                peer,
              });
            });
            setPeers(peers);
          });
  
          // 8- in server.js
          // 9- push newly created user in Peers list
          socketRef.current.on("user joined", (payload) => {
            console.log("==",payload)
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
            });
            const peerObj = {
              peer,
              peerID: payload.callerID,
            };
            setPeers((users) => [...users, peerObj]);
          });
  
          socketRef.current.on("user left", (id) => {
            const peerObj = peersRef.current.find((p) => p.peerID === id);
            if (peerObj) {
              peerObj.peer.destroy();
            }
            const peers = peersRef.current.filter((p) => p.peerID !== id);
            peersRef.current = peers;
            setPeers(peers);
          });
  
          socketRef.current.on("receiving returned signal", (payload) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);
            item.peer.signal(payload.signal);
          });
  
          socketRef.current.on("change", (payload) => {
            setUserUpdate(payload);
          });
        }
      });
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => { // Peer library itself emits 'signal'
      // 6- emit this users signal to backend
      // 7- in server.js
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    // 10- Peer lib signal
    peer.on("signal", (signal) => {
      // 11- emit peer added signal
      // 12- in server.js
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    // 13- peer Lib stream video signal, to be added in new <video> tags
    peer.on('stream', (currentStream) => {
      setOtherStreams((str) => ({...str, [callerID]: currentStream}));
      console.log("Adding incoming stream :", otherStreans);
    });


    peer.signal(incomingSignal);

    return peer;
  }

  useEffect(() => {
    if(currentRoomID && currentRoomID.roomID) {
      setTimeout(() => {
        // setVideo(false);
        createStream();
      }, 3000);
    }
  }, [currentRoomID]);

  return (
    <div className='position-relative' style={{height: '100vh'}}>
        {currentRoomID && <h3>Room ID - {currentRoomID.roomID}</h3>}
        Whose room ? {callStarter}
        {callStarter && inRoomData?.length === 1 && <div className='w-100 h-100 d-flex justify-content-center flex-column align-items-center'> 
            <Avatar sx={{width: 100, height: 100}}  alt={callData.otherUser.displayName} src={callData.otherUser.imgUrl}/>
            <h6 className='mt-2'>calling... {callData.otherUser.displayName}</h6>
        </div>}

        {/* all call attendee */}
        
          <>
            {inRoomData?.length > 1 &&  inRoomData.map(attendee => (<div>{attendee}</div>))}

            
            {currentRoomID && <div>
                <StyledVideo muted ref={userVideo} autoPlay playsInline />
                <Controls>
                    <ImgComponent
                    src={videoFlag ? webcam : webcamoff}
                    onClick={() => {
                        if (userVideo.current.srcObject) {
                        userVideo.current.srcObject.getTracks().forEach(function (track) {
                            if (track.kind === "video") {
                            if (track.enabled) {
                                socketRef.current.emit("change", [...userUpdate,{
                                id: socketRef.current.id,
                                videoFlag: false,
                                audioFlag,
                                }]);
                                track.enabled = false;
                                setVideoFlag(false);
                            } else {
                                socketRef.current.emit("change", [...userUpdate,{
                                id: socketRef.current.id,
                                videoFlag: true,
                                audioFlag,
                                }]);
                                track.enabled = true;
                                setVideoFlag(true);
                            }
                            }
                        });
                        }
                    }}
                    />
                    &nbsp;&nbsp;&nbsp;
                    <ImgComponent
                    src={audioFlag ? micunmute : micmute}
                    onClick={() => {
                        if (userVideo.current.srcObject) {
                        userVideo.current.srcObject.getTracks().forEach(function (track) {
                            if (track.kind === "audio") {
                            if (track.enabled) {
                                socketRef.current.emit("change",[...userUpdate, {
                                id: socketRef.current.id,
                                videoFlag,
                                audioFlag: false,
                                }]);
                                track.enabled = false;
                                setAudioFlag(false);
                            } else {
                                socketRef.current.emit("change",[...userUpdate, {
                                id: socketRef.current.id,
                                videoFlag,
                                audioFlag: true,
                                }]);
                                track.enabled = true;
                                setAudioFlag(true);
                            }
                            }
                        });
                        }
                    }}
                    />
                </Controls>
                {peers.map((peer, index) => {
                    let audioFlagTemp = true;
                    let videoFlagTemp = true;
                    if (userUpdate) {
                    userUpdate.forEach((entry) => {
                        if (peer && peer.peerID && peer.peerID === entry.id) {
                        audioFlagTemp = entry.audioFlag;
                        videoFlagTemp = entry.videoFlag;
                        }
                    });
                    }
                    return (
                    <div key={peer.peerID} >
                      id : {peer.peerID}
                        <Video othStream={otherStreans} peer={peer.peer} id={peer.peerID} />
                        <ControlSmall>
                        <ImgComponentSmall src={videoFlagTemp ? webcam : webcamoff} />
                        &nbsp;&nbsp;&nbsp;
                        <ImgComponentSmall src={audioFlagTemp ? micunmute : micmute} />
                        </ControlSmall>
                    </div>
                    );
                })}
            </div>}

          </>

        
        
        {/* self video */}
        <div className='users-vid'>
            {
                // videoSettingOn ? 
                <video className='w-100 h-100' playsInline muted autoPlay ref={selfVideoRef}></video> 
                // : 
                // <Avatar sx={{width: 100, height: 100}}  alt={callData.currentUser.displayName} src={callData.currentUser.imgUrl}/>
            }
        </div>

        {/* self video controls */}
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
                <div className='p-2'>
                    <PersonAddAltIcon role="button" onClick={() => setShowAddUserModal(!showAddUserModal)} />
                </div>
            </div>
        </div>

        {/* modal to add user in call */}
        {followingUsers && followingUsers.userIdList && 
          <Modal
            open={showAddUserModal}
            onClose={() => setShowAddUserModal(false)}
          >
            <div style={getModalStyle()} className={classes.paper}>
              <UserLists userIdList={followingUsers} iconList={[{name: 'call', func : addUser}]}/>
            </div>
          </Modal> 
        }
    </div>
  )
}

export default CallWindow;