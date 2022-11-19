import React from 'react'
import './MessageRoom.css';
import logo from '../../assets/logo2.png';
import { useEffect } from 'react';
import { useState } from 'react';
import { getUser, messageUser } from '../../Utils';
import { Avatar, Button } from '@mui/material';
import { onValue, ref, set, update, child, push } from "firebase/database";
import {realtime_db} from '../../firebase-config';
import { serverTimestamp } from "firebase/firestore";


function MessageRoom({currentUser, otherUser}) {
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const[messageInput, setMessageInput] = useState('');
  const [allMessages, setAllMessages] = useState(null);

  useEffect(() => {
    if(otherUser) {
      getUser(otherUser).then(data => setOtherUserInfo(data));

      // retreive all msgs with 'otherUser'
      const query = ref(realtime_db, "messages/" + currentUser.uid + "/" + otherUser);
      return onValue(query, (snapshot) => {
        const data = snapshot.val();
        if (snapshot.exists() && data) {
          const promises = Object.values(data)
                            .sort((obj1, obj2) => obj1.timestamp - obj2.timestamp);
          setAllMessages(promises);
        } 
      });
    }
  }, [otherUser]);
  

  const sendMessage = () => {
    setMessageInput('');

    if(otherUser){
      const timeSt = Date.now();
      const body = {
        text: messageInput,
        timestamp: timeSt,
        media: null,
        whoWrote: currentUser.uid
      };
      // add currentUsers msg in database
      messageUser(currentUser.uid, otherUser, body);
    }
  }

  return (
    <div className='message-room'>
      {
        otherUserInfo !== null && 
        <div className='d-flex flex-column main-container h-100'>
          <div className='otheruser-header d-flex align-items-center'>
            <Avatar className='search-avatar' alt={otherUserInfo.username || 'UNKNOWN USER'} src={otherUserInfo.imgUrl || 'dnsj.com'}/>
              <div>
                <div className='userName'><strong>{otherUserInfo.username || 'UNKNOWN USER'}</strong></div>
              </div>
          </div>
          {/* msg list */}
          <div className='message-scroll-container h-100 p-4'>
            {
              allMessages && allMessages.length > 0 && allMessages.map((data) => (
                <div className='pb-3'>
                  {
                    data.whoWrote === otherUserInfo.uid && 
                    <div className='d-flex flex-start align-items-center user-message other'>
                        <Avatar className='search-avatar' alt={otherUserInfo.username || 'UNKNOWN USER'} src={otherUserInfo.imgUrl || 'dnsj.com'}/>
                      <div>
                        <div className='titleUserName other'>{data.text}</div>
                      </div>
                    </div>
                  }
                  {
                    data.whoWrote === currentUser.uid && 
                    <div className='d-flex flex-end  align-items-center justify-content-end user-message'>
                        
                      <div>
                        <div className='titleUserName'>{data.text}</div>
                      </div>
                    </div>
                  }
                </div>     
              ))
            }
          </div>
          {/* msg input */}
          <form className='post-message'>
              <input type='text' className='post-message-text' placeholder='Enter message...' value={messageInput} onChange={(event) => setMessageInput(event.target.value)} />
              <Button onClick={() => sendMessage()} disabled={messageInput === ''} className='post-message-btn'>Send</Button>
            </form>
        </div>
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
