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

const ItemImage = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '10em',
  
  color: theme.palette.text.secondary,
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

function UserProfile({user, currentUserId}) {
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

  return (
    <div>
      {!setEditPageOpen && 
      <div className='d-flex flex-column justify-content-center align-items-center'>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <ItemImage>
              <div className='user-profile-avatar'>
                <Avatar alt={user.displayName} src={user.imgUrl}
                sx={{ width: 100, height: 100 }}/>
              </div>
            </ItemImage>
          </Grid>
          <Grid item xs={8}>
            <Item>
              <span className='user-header'>
                {/* TODO - replace with username */}
                <strong className='text-space'>{user.username}</strong>
                {currentUserId && currentUserId === user.uid && <div>
                  <Button  className='text-space' onClick={() => openEditProfile()}>Edit profile</Button>
                  <IconButton  className='text-space'>
                    <LogoutIcon />
                  </IconButton>
                </div>}
                {
                  currentUserId && currentUserId !== user.uid && 
                  <div>
                    {!doIFollow && <Button  className='text-space' onClick={() => followUserID(user)}>Follow</Button>}
                    {doIFollow && <Button  className='text-space' onClick={() => unfollowUserID(user)}>UnFollow</Button>}
                  </div>
                }
              </span>
              <span className='user-header my-3'>
                <span className='text-space'>{noOfPosts} Posts</span>
                <span className='text-space' onClick={() => setShowFollowers(true)}>{noOfFollowers} Followers</span>
                <span className='text-space' onClick={() => setShowFollowing(true)}>{noOfFollowing} Following</span>
              </span>
              <div>
                <strong className='text-space'>
                  {user.displayName}
                </strong>
                <p className='text-space'>
                  {user.bio}
                </p>
              </div>

            </Item>
          </Grid>
        </Grid>
        <div className='w-100'>
          <Grid>
            <Item>
              <Tabs
                value={tabValue}
                onChange={(e, no) => setTabValue(no)}
                aria-label="icon position tabs example"
              >
                <Tab icon={<GridOnIcon />} iconPosition="start" label="Posts" />
                <Tab icon={<BookmarkBorderIcon />} iconPosition="start" label="Saved" />
              </Tabs>
                {tabValue === 0 && <PostsGrid user={user}/>}
                {tabValue === 1 && <p>Under construction!</p>}
            </Item>
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
