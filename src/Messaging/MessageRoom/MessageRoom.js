import React from 'react'
import './MessageRoom.css';
import logo from '../../assets/logo2.png';
import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getUser, messageUser, deleteMessageFromDB, updateReaction, getTimeAgo } from '../../Utils';
import { Avatar, Button, Popover } from '@mui/material';
import { onValue, ref, set, update, child, push } from "firebase/database";
import {realtime_db} from '../../firebase-config';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import { useRef } from 'react';
import { getStorage, ref as Reff, getDownloadURL, uploadBytesResumable  } from "firebase/storage";
import EmojiPicker from 'emoji-picker-react';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import EmojiKeyboard from '../../EmojiKeyboard/EmojiKeyboard';
import ReplyAllOutlinedIcon from '@mui/icons-material/ReplyAllOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Close } from '@mui/icons-material';
import { LinkPreview } from '@dhaiwat10/react-link-preview';  // will need express server to do get http reuqest and overcome cors
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';

function MessageRoom({currentUser, otherUser, children}) {
  const [otherUserInfo, setOtherUserInfo] = useState(otherUser == null ? null : otherUser);
  const[messageInput, setMessageInput] = useState('');
  const [allMessages, setAllMessages] = useState(null);
  const [reset, setReset] = useState('');
  const [messageKeys, setMessageKeys] = useState([]);
  const [repliedTo, setRepliedTo] = useState(null);
  const [callAttr, setCallAttr] = useState(null);

  const currView = useSelector((state) => state.view);
  const metaData = useSelector((state) => state.metaData);
  const dispatcher = useDispatch();
  

  const refe = useRef();

  useEffect(() => {
    if(otherUser) {
      getUser(otherUser).then(data => setOtherUserInfo(data));

      // retreive all msgs with 'otherUser'
      const query = ref(realtime_db, "messages/" + currentUser.uid + "/" + otherUser);
      return onValue(query, (snapshot) => {
        const data = snapshot.val();
        if (snapshot.exists() && data) {
          setMessageKeys(Object.keys(data));
          const promises = Object.values(data)
                            .sort((obj1, obj2) => obj1.timestamp - obj2.timestamp);
          setAllMessages(promises);
        } 
      });
    }
  }, [otherUser]);
  

  const sendMessage = (e) => {
    setReset(true);
    e.preventDefault();
    if(otherUser && messageInput){
      const timeSt = Date.now();
      const body = {
        text: messageInput,
        timestamp: timeSt,
        media: null,
        whoWrote: currentUser.uid,
        repliedTo: repliedTo
      };
      // add currentUsers msg in database
      messageUser(currentUser.uid, otherUser, body);
      setMessageInput('');
      refe.current.reset();
    }
    setReset(false);
    setRepliedTo(null);
  }

  const handleChange = async (event) => {
    if(event.target.files){
      const allFiles_ = Array.from(event.target.files);
      await Promise.all(
        allFiles_.map((file_) => {
            return new Promise((res, rej) => {
                const storage = getStorage();
                const storageRef = Reff(storage, `images/${file_.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file_);
                
                uploadTask.on("state_changed",
                    // update progress
                    (snapshot) => {
                        const progress =
                        Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    },
                    // catch error
                    (error) => {
                        console.log("Err while uplaoding message",error);
                        rej();
                    },
                    // function to be called once file is completely uploaded
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                          const timeSt = Date.now();
                          const body = {
                            text: null,
                            timestamp: timeSt,
                            media: {
                              type: file_.type,
                              url: downloadURL
                            },
                            whoWrote: currentUser.uid
                          };
                          // add currentUsers msg in database
                          messageUser(currentUser.uid, otherUser, body);
                        });
                    }
                );
            });
        })
    ).catch(err => console.err("Err wile adding message ::", err));
  }
  }

  const reactedEmoji = (emojiText, id) => {
    const msgKey = messageKeys[id];
    const msgValue = {
      [currentUser.uid] : emojiText 
    };
    updateReaction(currentUser.uid, otherUser, msgKey, msgValue);
  }

  const deleteMessage = (key) => {
    deleteMessageFromDB(currentUser.uid, otherUser, key);
  }

  const replyToMsg = (key) => {
    const id = allMessages[key].whoWrote;
    const body = {
      id : id,
      msgId: messageKeys[key],
      msg : allMessages[key].text || allMessages[key].call?.text || (allMessages[key].media?.type.includes('image') ? 'Photo' :'Video'),
      media : (allMessages[key].media?.type ? allMessages[key].media.url : null )
    }
    setRepliedTo(body);
  }

  const callUser = (callType) => {
    setCallAttr({callTo : otherUser, currentUser: currentUser, otherUser: otherUserInfo, callType : callType});
    dispatcher({type: "CALL", metaData: {callTo : otherUser, currentUser: currentUser, otherUser: otherUserInfo, callType : callType, roomOwner: currentUser.uid} });
  }

  return (
    <div className='message-room md:border-1 xl:border-1 lg:border-1 border-gray-300'>
      {
        otherUserInfo ?
        <div className='d-flex flex-column main-container h-100'>
          <div className='otheruser-header d-flex align-items-center'>
            <div className='d-flex align-items-center'>
              <div className='position-relative flex'>
                {children}
                <Avatar className='search-avatar' alt={otherUserInfo.username || 'UNKNOWN USER'} src={otherUserInfo.imgUrl || 'dnsj.com'}/>
              </div>
                <div>
                  <div className='userName'><strong>{otherUserInfo.username || 'UNKNOWN USER'}</strong></div>
                </div>
            </div>
            <div className='d-flex'>
              <div className='p-1' role="button" onClick={() => callUser("VOICE")}>
                <LocalPhoneOutlinedIcon/>
              </div>
              <div className='p-1' role="button" onClick={() => callUser("VIDEO")}>
                <VideoCallOutlinedIcon/>
              </div>
            </div>
          </div>
          {/* msg list */}
          <div className='message-scroll-container h-100 pt-4 px-2'>
            {
              allMessages && allMessages.length > 0 && allMessages.map((data, index) => (
                <div className='pb-4'>
                  {
                    data.whoWrote === otherUserInfo.uid && 
                    <div className='d-flex flex-start align-items-center user-message other'>
                        {(allMessages.length - 1 === index || (allMessages[index + 1] &&  allMessages[index + 1].whoWrote && allMessages[index + 1].whoWrote === currentUser.uid)) && 
                            <Avatar className='search-avatar' alt={otherUserInfo.username || 'UNKNOWN USER'} src={otherUserInfo.imgUrl || 'dnsj.com'}/>
                        }
                        <div className={(allMessages.length - 1 === index || (allMessages[index + 1] &&  allMessages[index + 1].whoWrote && allMessages[index + 1].whoWrote === currentUser.uid)) ? 'd-flex flex-column' :'d-flex flex-column shift-left'}>
                        {data.repliedTo && 
                          <div className='reply-left'>
                            <p className='replied-to-text'>Replied to {data.repliedTo.id === currentUser.uid ? 'You' : 'themself'}</p>
                            {data.repliedTo.msg !== "Photo" && data.repliedTo.msg !== "Video" ? <p>{data.repliedTo.msg}</p> : 
                              (<div>
                                {(data.repliedTo.msg === "Photo" || data.repliedTo.msg === "Video") && <img className='content-msg-img' alt='img' src={data.repliedTo.media || ''}/>}
                              </div>)
                            }
                          </div>
                        }
                      <div className='position-relative'>
                        {data.text && <p className='titleUserName other'>{data.text}</p>}
                        {data.call?.text && 
                          <>
                            <p className='titleUserName other'>
                              <strong>{data.call.text}</strong>
                              <br/>
                              {getTimeAgo(data.timestamp)}
                            </p>
                          </>
                        }
                        {data.media && data.media.type === 'image/jpeg' && <img className='content-msg-img' alt='img' src={data.media.url || ''}/>}
                        {data.media && data.media.type === 'video/mp4' && <video controls className='content-msg-video' alt='video' src={data.media.url || ''}/>}
                        {/* message emoji reactions */}
                        {data.reaction && 
                          <div className='msg-reaction-other'>
                            {Object.values(data.reaction).map(emojiData => (
                              <div>{emojiData}</div>
                            ))}
                          </div>
                        }
                      </div>
                      </div>
                      <div className={(allMessages.length - 1 === index || (allMessages[index + 1] &&  allMessages[index + 1].whoWrote && allMessages[index + 1].whoWrote === currentUser.uid)) ? 'msg-extra-btn d-flex align-items-center' :'msg-extra-btn d-flex align-items-center shift-left'}>
                        <EmojiKeyboard className='mx-1' setInputText={setMessageInput} customEmoji={reactedEmoji} msgKey={index}/>
                        <ReplyAllOutlinedIcon role="button" className='mx-1' onClick={() => replyToMsg(index)}  />
                      </div>
                    </div>
                  }
                  {
                    data.whoWrote === currentUser.uid && 
                    <div className='d-flex flex-end  align-items-center justify-content-end user-message'>
                      <div className='msg-extra-btn d-flex align-items-center'>
                        <DeleteOutlinedIcon role="button" onClick={() => deleteMessage(messageKeys[index])} className='mx-1'  />
                        <ReplyAllOutlinedIcon role="button" className='mx-1'  onClick={() => replyToMsg(index)}  />
                        <EmojiKeyboard className='mx-1' setInputText={setMessageInput} customEmoji={reactedEmoji} msgKey={index}/>
                      </div>
                      <div className='d-flex flex-column'>
                        {data.repliedTo && 
                            <div className='reply-right'>
                              <p className='replied-to-text'>{data.repliedTo.id !== currentUser.uid ? 'You replied' : 'You replied to yourself'}</p>
                              {data.repliedTo.msg !== "Photo" && data.repliedTo.msg !== "Video" ? <p>{data.repliedTo.msg}</p> : 
                                (<div>
                                  {(data.repliedTo.msg === "Photo" || data.repliedTo.msg === "Video") && <img className='content-msg-img' alt='img' src={data.repliedTo.media || ''}/>}
                                </div>)
                              }
                            </div>
                          }
                        <div className='position-relative'>
                          {data.text && <p className='titleUserName'>{data.text}</p>}
                          {data.call?.text && 
                            <>
                              <p className='titleUserName other'>
                                <strong>{data.call.text}</strong>
                                <br/>
                                {getTimeAgo(data.timestamp)}
                              </p>
                            </>
                          }
                          {data.media && (data.media.type === 'image/jpeg' || data.media.type === 'image/webp') && <img className='content-msg-img' alt='img' src={data.media.url || ''}/>}
                          {data.media && data.media.type === 'video/mp4' && <video controls className='content-msg-video' alt='video' src={data.media.url || ''}/>}
                          {/* message emoji reactions */}
                          {data.reaction && 
                            <div className='msg-reaction'>
                              {Object.values(data.reaction).map(emojiData => (
                                <div>{emojiData}</div>
                              ))}
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>     
              ))
            }
          </div>
          {/* msg input */}
          <form className='post-message d-flex flex-column w-100' onSubmit={(e) => sendMessage(e)}>
              {
                repliedTo && 
                  (<div className='d-flex replied-container p-2'>
                    <div className='w-100 flex-column d-flex'>
                      <span className='replied-to-text'> Replied to {repliedTo.id === currentUser.uid ? 'yourself' : otherUserInfo.displayName}</span>
                      <span className='limit-text'> {repliedTo.msg} </span>
                    </div>
                    <div role="button" className='d-flex align-items-center' onClick={() => setRepliedTo(null)}> <Close/></div>
                  </div>)
              }
            <div className='d-flex w-100'>
              <EmojiKeyboard setInputText={setMessageInput} reset={reset} inputText='' placeholder='Enter message...' />
              {<div className={'p-1 file-upload-msg'} onClick={() =>  refe.current.click()}> 
                        <CollectionsOutlinedIcon />
                        <input ref={refe} multiple type="file" style={{display: 'none'}} onChange={(e) => handleChange(e)}/>
                    </div>}
              <button onClick={(e) => sendMessage(e)} disabled={!(messageInput && messageInput.length > 0)} className={(messageInput && messageInput.length > 0 ? 'text-blue-400': 'text-gray-500') +  ' font-semibold px-2'}>Send</button>
            </div>
            </form>
        </div> : null
      }
      {/* empty state */}
      {otherUserInfo === null && 
        <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
          <img src={logo} alt='logo' width={'200px'} height={'200px'} />
          <span>
            Your messages
          </span>
          <span>
            Send pics and videos to your friend !!
          </span>
        </div>
      }  
    </div>
  )
}

export default MessageRoom;
