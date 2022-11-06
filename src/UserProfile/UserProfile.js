import { Avatar } from '@material-ui/core';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import './UserProfile.css';
import IconButton from "@mui/material/IconButton";
import LogoutIcon from '@mui/icons-material/Logout';
import Editprofile from '../Editprofile/Editprofile';

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

function UserProfile({user}) {
  const [setEditPageOpen, openEditProfilePage] = useState(false);
  
  const openEditProfile = () => {
    openEditProfilePage(!setEditPageOpen);
  }

  return (
    <div>
      {!setEditPageOpen && <Grid container spacing={2}>
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
              <div>
                <Button  className='text-space' onClick={() => openEditProfile()}>Edit profile</Button>
                <IconButton  className='text-space'>
                  <LogoutIcon />
                </IconButton>
              </div>
            </span>
            <span className='user-header my-3'>
              <span className='text-space'>0 Posts</span>
              <span className='text-space'>0 Followers</span>
              <span className='text-space'>0 Following</span>
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
        </Grid>}
      {
        setEditPageOpen && <Editprofile user={user}/>
      }
    </div>
  )
}

export default UserProfile;
