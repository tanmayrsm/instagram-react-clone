import { Avatar } from '@mui/material';
import React, { useEffect, useState } from 'react'
import {db} from '../firebase-config';
import './SearchUser.css';
import {noUserFoundImg} from '../AssetUtils';
import UserProfile from '../UserProfile/UserProfile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


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
      { showParticularUserPage && !showParticularUserPage.show && <div className='search-container xs:w-full xs:h-full d-flex justify-content-center'>
        <div className='sm:w-full xs:w-full xl:w-1/2 lg:w-1/2 md:w-1/2 '>
                <input type='text' className='bg-gray-100 border-gray-300 text-gray-900 text-sm rounded-t-none rounded-lg focus:ring-blue-500 xs:rounded-none focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' placeholder='Search users...' onChange={(e) => setSearchText(e.target.value)}></input>
            
            {
                !emptyState && allUsers && allUsers.length && allUsers.map((particularUser) => (
                    <div className="d-flex align-items-center hover:bg-gray-100 rounded-sm p-2" role="button" onClick={() => setShowParticularUserPage({show: true, user: particularUser})}>
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
            <ArrowBackIcon onClick={() => setShowParticularUserPage({show: false, user: null})}>back</ArrowBackIcon>
            <UserProfile user={showParticularUserPage.user} currentUserId={user.uid} />
        </div>
      }
      
    </div>
  )
}

export default SearchUser;