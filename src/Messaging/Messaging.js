import React, { useEffect } from 'react'
import {realtime_db} from '../firebase-config';
import { onValue, ref, set, update } from "firebase/database";
import Grid from '@mui/material/Grid';
import MessageRoom from './MessageRoom/MessageRoom';
import { useState } from 'react';
import {getUser, setUserStatus} from '../Utils';
import MessageFragment from './MessageFragment/MessageFragment';
import './Messaging.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

  return (
    <div className=''>
      <Grid container>
          <Grid item xs={12} sm={4} md={4} lg={4} xl={4} className={(activatedChatWith ? 'xs:hidden' : '')  + ' sm:pr-2 md:pr-2 xl:pr-2 lg:pr-2'}>
            {/* list of all people whom to message */}
            <div className='bg-white h-100 p-2 md:border-1 xl:border-1 lg:border-1 border-gray-300'>
              <div className='msg-user d-flex align-items-center justify-content-center'>
                <span>
                  {currentUser.username}
                </span>
              </div>
              {sortedUserList && sortedUserList.length ? sortedUserList.map((val, index) => 
                (<div className='message-fragment' key={val[0]} onClick={() => setActivatedChatWith(val[0])}>
                  <MessageFragment userKey={val[0]} message={val[1]} time={val[2]} />
                </div>)
              ): <p className='w-full text-center pt-3'>No messages yet!</p>}
            </div>
          </Grid>
          <Grid item xs={12} sm={8} md={8} lg={8} xl={8} className={(!activatedChatWith ? 'xs:hidden' : '')}>
            {/* message form container */}
            <MessageRoom currentUser={currentUser} otherUser={activatedChatWith} key={activatedChatWith}> 
              <div className='xs:block lg:hidden xl:hidden md:hidden pr-2 pt-2'><ArrowBackIcon onClick={() => setActivatedChatWith(undefined)} /></div>        
            </MessageRoom>
          </Grid>
      </Grid>
    </div>
  )
}

export default Messaging
