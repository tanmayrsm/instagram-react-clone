import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import micmute from "../assets/micmute.svg";
import micunmute from "../assets/micunmute.svg";
import webcam from "../assets/webcam.svg";
import webcamoff from "../assets/webcamoff.svg";
import { v1 as uuid } from "uuid";


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

const GroupCall = (props) => {
  const [peers, setPeers] = useState([]);
  const [audioFlag, setAudioFlag] = useState(true);
  const [videoFlag, setVideoFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const [otherStreans, setOtherStreams] = useState();
  const [roomID, setRoomId] = useState();
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
  useEffect(() => {
    socketRef.current = io.connect("http://localhost:5000");
    // createStream();
  }, []);

  function createStream() {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join room", roomID);
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
      });
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
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

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on('stream', (currentStream) => {
      setOtherStreams((str) => ({...str, [callerID]: currentStream}));
      console.log("Adding incoming stream :", otherStreans);
    });


    peer.signal(incomingSignal);

    return peer;
  }

  const createRoom = () => {
    setRoomId(uuid());
  }

  const joinRoom = () => {
    if(inptRef && inptRef.current.value) {
        setRoomId(inptRef.current.value);
    }
  }

  useEffect(() => {
    if(roomID) {
        createStream();
    }
  }, [roomID])

  return (
    <Container>
        {
            <div>
                <button onClick={() => createRoom()}>Create room</button>
                <br/>
                <input placeholder="enter room id" type="text" ref={inptRef}></input>
                <button onClick={() => joinRoom()}>Join room</button>
            </div>
        }
        {roomID && <div>
            Room id - {roomID}
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
    </Container>
  );
};

export default GroupCall;
