import { Avatar } from '@mui/material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import { getUser } from '../../Utils';
import './MessageFragment.css';

function MessageFragment({userKey, message, time}) {
  const [userInfo, setUserInfo] = useState(null);
  const [usersLatestMsg, setLatestMsg] = useState(null);

  useEffect(() => {
    getUser(userKey).then((data) => {
      setUserInfo(data);
    });

  }, []);

  return (
    <div>
        {userInfo && <div className="d-flex align-items-center msg-fragment">
            <Avatar className='search-avatar' alt={userInfo.username || 'UNKNOWN USER'} src={userInfo.imgUrl || 'dnsj.com'}/>
            <div>
              <div className='userName'><strong>{userInfo.username || 'UNKNOWN USER'}</strong></div>
              <div className='userName'>{message}</div>
            </div>
        </div>}
    </div>
  )
}

export default MessageFragment
