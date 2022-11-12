import { Avatar } from '@mui/material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import {getAllUsersWithId} from '../Utils';

function UserLists({userIdList}) {
    const [allUsers, setAllUsers] = useState([]);
    useEffect(() => {
        Promise.all(getAllUsersWithId(userIdList.userIdList)).then(val => {
            setAllUsers(val);
        });
    }, []);

  return (
    <div>
      {allUsers.length > 0 && allUsers.map((user) =>  
        (<div className="d-flex align-items-center mb-4">
                <Avatar className='search-avatar' alt={user.username || 'UNKNOWN USER'} src={user.imgUrl || 'dnsj.com'}/>
                <div className='userName'><strong>{user.username || 'UNKNOWN USER'}</strong></div>
            </div>)
       )}
    </div>
  )
}

export default UserLists;
