import { Avatar } from '@mui/material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import { getTimeAgo, getUser } from '../../Utils';
import './MessageFragment.css';
import { onValue, ref, set, update } from "firebase/database";
import {realtime_db} from '../../firebase-config';

function MessageFragment({userKey, message, time}) {
  const [userInfo, setUserInfo] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    getUser(userKey).then((data) => {
      setUserInfo(data);
    });
    console.log("User status ::", userKey, " :: stat ::", lastSeen);
    
      const query = ref(realtime_db, "online/" + userKey);
      onValue(query, (snap) => {
          if(typeof snap.val() === 'object') {
            setLastSeen('online');
          } else {
            setLastSeen(snap.val());
          }
      });
  }, []);

  return (
    <div>
        {userInfo && <div className="d-flex align-items-center msg-fragment" role="button">
          <div className='position-relative'>
            <Avatar className='search-avatar' alt={userInfo.username || 'UNKNOWN USER'} src={userInfo.imgUrl || 'dnsj.com'}/>
            {lastSeen === 'online' && <div className='online-div'></div>}
            
          </div>
            <div className='w-100'>
              <div className={lastSeen !== 'online' ? 'userName' : 'userName mw-modified'}><strong>{userInfo.username || 'UNKNOWN USER'}</strong></div>
              <div className='d-flex justify-content-space-between w-100'>
                <div className={lastSeen === 'online' ? 'userName' : 'userName mw-modified'}>{message}</div>
                { lastSeen !== 'online' && <span className='last-seen'>Active {getTimeAgo(lastSeen)}</span>}
              </div>
              
            </div>
        </div>}
    </div>
  )
}

export default MessageFragment
