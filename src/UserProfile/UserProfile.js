import { Avatar, Modal } from '@material-ui/core';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import './UserProfile.css';
import IconButton from "@mui/material/IconButton";
import LogoutIcon from '@mui/icons-material/Logout';
import Editprofile from '../Editprofile/Editprofile';
import { useEffect } from 'react';
import {db} from '../firebase-config';
import { getNoOfFollowers, getNoOfFollowing, followUser, unFollowUser, doIFollowUser, getAllFollowers, getAllFollowing } from '../Utils';
import PostsGrid from './PostsGrid/PostsGrid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GridOnIcon from '@mui/icons-material/GridOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import UserLists from '../UserLists/UserLists';
import {getModalStyle, useStyles} from '../stylesUtil.js';
import { useDispatch } from 'react-redux';
import AvatarStory from '../ViewStory/AvatarStory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function UserProfile({user, currentUserId, logout}) {
  const [setEditPageOpen, openEditProfilePage] = useState(false);
  const [noOfPosts, setNoOfPosts] = useState(0);
  const [noOfFollowers, setNoOfFollowers] = useState(0);
  const [noOfFollowing, setNoOfFollowing] = useState(0);
  const [doIFollow, setFollow] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [usersIdList, setUsersIdList] = useState(null);
  const classes = useStyles();
  
  const [tabValue, setTabValue] = useState(0);

  const dispatcher = useDispatch();

  useEffect(() => {
    // set no of followers
    getNoOfFollowers(user.uid).then(followers_ => {
      setNoOfFollowers(followers_);
    });

    
    // set no of following
    getNoOfFollowing(user.uid).then(following_ => {
      setNoOfFollowing(following_);
    });

    // set no of posts
    if(db && db.collection('posts')) {
      db.collection('posts')
      .onSnapshot((snapshot) => {
        const noOfUserPosts = snapshot.docs.filter(data => {
          return data.data().uid === user.uid;
        });
        setNoOfPosts(noOfUserPosts.length);
      });
    }

    // set whether I follow this user or not
    if(currentUserId !== user.uid) {
      doIFollowUser(currentUserId, user.uid).then((val) => {
        setFollow(val);
      });
    }
  }, []);

  useEffect(() => {
    
    setUsersIdList(null);
    setShowFollowing(false);
    if(showFollowers && noOfFollowers > 0) {
      getAllFollowers(user.uid).then((val) => {
        setUsersIdList({userIdList : val})
      });
    }
  }, [showFollowers])

  useEffect(() => {
    setUsersIdList(null);
    setShowFollowers(false);
    if(showFollowing && noOfFollowing > 0) {
      getAllFollowing(user.uid).then((val) => {
        setUsersIdList({userIdList : val})
      });
    }
  }, [showFollowing]);
  
  
  const followUserID = (user) => {
    setFollow(true);
    followUser(currentUserId, user.uid).then(() => {
      // set no of followers
      getNoOfFollowers(user.uid).then(followers_ => {
        setNoOfFollowers(followers_);
      });
    });
  }

  const unfollowUserID = (user) => {
      setFollow(false);
      unFollowUser(currentUserId, user.uid).then(() => {
          // set no of followers
        getNoOfFollowers(user.uid).then(followers_ => {
          setNoOfFollowers(followers_);
        });
      });
  }

  const openEditProfile = () => {
    openEditProfilePage(!setEditPageOpen);
  }

  const setMessageView = () => {
    dispatcher({type : "MESSAGING", metaData: {uid: user.uid}});
  }

  return (
    <div>
      {!setEditPageOpen && 
      <div className='d-flex flex-column justify-content-center align-items-center'>
        <Grid container spacing={2}>
          <Grid xs={4} sm={4} md={4} lg={4} xl={4}>
              <div className='user-profile-avatar xs:m-7 xs:w-full'>
                <AvatarStory user={user} currentUserId={currentUserId} />
              </div>
          </Grid>
          <Grid xs={8} sm={8} md={8} lg={8} xl={8}>
            <div className='xs:my-7 xs:flex xs:items-center xs:h-full flex-col justify-start'>
              <span className='flex items-center xs:items-start xs:flex-col xs:w-52'>
                <strong className='xl:mx-4 lg:mx-4 md:mx-4 font-semibold'>{user.username}</strong>
                {currentUserId && currentUserId === user.uid && <div>
                  <button className='bg-gray-200 text-sm hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded' onClick={() => openEditProfile()}>Edit profile</button>
                  {logout ? <IconButton  className='text-space'>
                    <LogoutIcon onClick={() => logout()} />
                  </IconButton> : null}
                </div>}
                {
                  currentUserId && currentUserId !== user.uid && 
                  <div className='flex'>
                    {!doIFollow && <button className='bg-blue-400 text-sm md:mx-1 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded' onClick={() => followUserID(user)}>Follow</button>}
                    {doIFollow && <button className='bg-gray-200 text-sm md:mx-1 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded' onClick={() => unfollowUserID(user)}>Following</button>}
                    {doIFollow && <button className='bg-gray-200 text-sm hover:bg-gray-300 mx-1 text-gray-800 font-semibold py-2 px-4 rounded' onClick={() => setMessageView()}>Message</button>}
                  </div>
                }
              </span>
              <span className='xs:hidden sm:hidden xl:flex lg:flex md:flex items-center my-3'>
                <span className='text-space'><strong>{noOfPosts}</strong> Posts</span>
                <span className='text-space' role={noOfFollowers > 0 ? 'button' : null} onClick={() => setShowFollowers(true)}><strong>{noOfFollowers}</strong> Followers</span>
                <span className='text-space' role={noOfFollowing > 0 ? 'button' : null} onClick={() => setShowFollowing(true)}><strong>{noOfFollowing}</strong> Following</span>
              </span>
              <span className='flex justify-start flex-col w-100'>
                <p className='xs:ml-8 sm:ml-8 md:ml-4 xl:ml-4 lg:ml-4 xs:mx-8 font-semibold'>
                  {user.displayName}
                </p>
                <p className='xs:ml-8 sm:ml-8 md:ml-4 xl:ml-4 lg:ml-4 xs:mx-8'>
                  {user.bio}
                </p>
              </span>
            </div>
          </Grid>
        </Grid>
        <div className='w-100'>
          <span className='xl:hidden lg:hidden md:hidden xs:flex sm:flex items-center w-100 justify-between my-3'>
                <span className='text-space'><strong>{noOfPosts}</strong> Posts</span>
                <span className='text-space' role={noOfFollowers > 0 ? 'button' : null} onClick={() => setShowFollowers(true)}><strong>{noOfFollowers}</strong> Followers</span>
                <span className='text-space' role={noOfFollowing > 0 ? 'button' : null} onClick={() => setShowFollowing(true)}><strong>{noOfFollowing}</strong> Following</span>
          </span>
          <Grid>
              <Tabs
                value={tabValue}
                onChange={(e, no) => setTabValue(no)}
                aria-label="icon position tabs example"
              >
                <Tab icon={<GridOnIcon />} iconPosition="start" label="Posts" />
                <Tab icon={<BookmarkBorderIcon />} iconPosition="start" label="Saved" />
              </Tabs>
                {tabValue === 0 ? <PostsGrid user={user} currentUserId={currentUserId}/> : null}
                {tabValue === 1 ? <PostsGrid saved={true} user={user} currentUserId={currentUserId}/>: null}
          </Grid>
        </div>
        {usersIdList && usersIdList.userIdList && 
          <Modal
            open={showFollowers || showFollowing}
            onClose={() => {setShowFollowers(false); setShowFollowing(false)}}
          >
            <div style={getModalStyle()} className={classes.paper}>
              <UserLists userIdList={usersIdList}/>
            </div>
          </Modal> 
        }
      </div>
      }
      {
        setEditPageOpen && <Editprofile user={user}/>
      }
    </div>
  )
}

export default UserProfile;
