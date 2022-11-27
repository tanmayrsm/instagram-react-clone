import React, { useEffect } from 'react'
import {realtime_db} from '../firebase-config';
import { onValue, ref, set, update } from "firebase/database";
import Grid from '@mui/material/Grid';
import MessageRoom from './MessageRoom/MessageRoom';
import { useState } from 'react';
import {getUser, setUserStatus} from '../Utils';
import MessageFragment from './MessageFragment/MessageFragment';
import './Messaging.css';

function Messaging({currentUser, otherUserId}) {
  const [otherUser, setOtherUser] = useState(null);
  const [allMessagedUsers, setAllMessagedUsers] = useState(null);
  const [activatedChatWith, setActivatedChatWith] = useState(otherUserId);
  const [sortedUserList, setSortedUserList] = useState([]);
    
  useEffect(() => {
    if(otherUserId) {
      getUser(otherUserId).then(data => setOtherUser(data));
    }
    const query = ref(realtime_db, "messages/" + currentUser.uid );
    setUserStatus(currentUser.uid, true);  // set user online status
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (snapshot.exists()) {
        if(otherUserId && !data[otherUserId]) {
          data[otherUserId] = {};
        }
        setAllMessagedUsers(data);
      } 
    });
  }, []);

  useEffect(() => {
    let sortedList = [];
    for(var user in allMessagedUsers) {
      sortedList.push([user, allMessagedUsers[user]]);
    }
    sortedList.sort((user1, user2) => {
      // logic to show messages in order on left side, latest first
      const ts1 = Object.values(user1[1])[Object.values(user1[1]).length - 1].timestamp;
      const ts2 = Object.values(user2[1])[Object.values(user2[1]).length - 1].timestamp;
      return ts2 - ts1;
    });
    sortedList = sortedList.map(val => {
      // show latest message along with timestamp in fragmemt
      const len = Object.values(val[1]).length;
      const obj = Object.values(val[1])[len - 1];
      const text = obj.text;
      const timeStamp = obj.timestamp;
      return [val[0], text, timeStamp];
    })
    setSortedUserList(sortedList);
  }, [allMessagedUsers]);

  useEffect( () => () => setUserStatus(currentUser.uid, false), [] ); // user offline status

  return (
    <div className=''>
      <Grid container spacing={2}>
          <Grid item xs={4}>
            {/* list of all people whom to message */}
            <div className='msg-list-container bg-white p-2'>
              <div className='msg-user d-flex align-items-center justify-content-center'>
                <span>
                  {currentUser.username}
                </span>
              </div>
              {sortedUserList && sortedUserList.length && sortedUserList.map(val => 
                (<div className='message-fragment' key={val[0]} onClick={() => setActivatedChatWith(val[0])}>
                  <MessageFragment userKey={val[0]} message={val[1]} time={val[2]} />
                </div>)
              )}
            </div>
          </Grid>
          <Grid item xs={8}>
            {/* message form container */}
            <MessageRoom currentUser={currentUser} otherUser={activatedChatWith}/>
          </Grid>
      </Grid>
    </div>
  )
}

export default Messaging
