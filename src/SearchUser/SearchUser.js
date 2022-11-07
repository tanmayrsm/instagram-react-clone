import { Avatar } from '@mui/material';
import React, { useEffect, useState } from 'react'
import {db} from '../firebase-config';
import './SearchUser.css';
import {noUserFoundImg} from '../AssetUtils';
import UserProfile from '../UserProfile/UserProfile';

function SearchUser({user, currentUserId}) {
    const [allUsers, setAllUsers] = useState([]);
    const [searchtext, setSearchText] = useState('');
    const [emptyState, setEmptyState] = useState(false);
    const [showParticularUserPage, setShowParticularUserPage] = useState({show: false, user: null});

    // fetch all user data on page load
    useEffect(() => {
        db.collection('user')
        .onSnapshot((snapshot) => {
            const usersData = snapshot.docs.map(queryObj => {
                return queryObj.data();
            });
            setAllUsers(usersData);
        });
    }, []);

    // set empty set as per users fetched
    useEffect(() => {
        if(allUsers.length === 0) {
            setEmptyState(true);
        } else {
            setEmptyState(false);
        }
    }, [allUsers]);

    // trigger search results on search text change
    useEffect(() => {
        db.collection('user')
        .onSnapshot((snapshot) => {
            const usersData = snapshot.docs.map(queryObj => {
                return queryObj.data();
            }).filter((userData) => {
                return userData.username.includes(searchtext);
            });
            if(usersData.length === 0) {
                setEmptyState(true);
            }
            setAllUsers(usersData);
        });
    }, [searchtext]);

  return (
    <div>
      { showParticularUserPage && !showParticularUserPage.show && <div className='search-container d-flex justify-content-center'>
        <div className='w-50'>
            <input type='text' className='w-100 search-text mb-4' placeholder='Search users...' onChange={(e) => setSearchText(e.target.value)}></input>
            
            {
                !emptyState && allUsers && allUsers.length && allUsers.map((particularUser) => (
                    <div className="d-flex align-items-center mb-4" onClick={() => setShowParticularUserPage({show: true, user: particularUser})}>
                        <Avatar className='search-avatar' alt={particularUser.username || 'UNKNOWN USER'} src={particularUser.imgUrl || 'dnsj.com'}/>
                        <div className='userName'><strong>{particularUser.username || 'UNKNOWN USER'}</strong></div>
                    </div>
                ))
            }
            {
                emptyState && <div className='d-flex align-items-center empty-state mt-4'>
                    <img src={noUserFoundImg} alt='No user found' style={{height: '14em', width: '19em'}}/>
                    <p>No users exist! </p>
                </div>
            }
        </div>
      </div>}

      { showParticularUserPage && showParticularUserPage.show && showParticularUserPage.user &&
        <div>
            <p onClick={() => setShowParticularUserPage({show: false, user: null})}>back</p>
            <UserProfile user={showParticularUserPage.user} currentUserId={user.uid} />
        </div>
      }
      
    </div>
  )
}

export default SearchUser;