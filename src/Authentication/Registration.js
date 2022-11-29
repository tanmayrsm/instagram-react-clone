import { Button, Grid, Input } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import './Authentication.css';

function Registration({signUp, openSignIn}) {
  const instaLogo = 'https://www.logo.wine/a/logo/Instagram/Instagram-Wordmark-Black-Logo.wine.svg';
  const signUpImg = 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2020/08/05/11/instagram-reels.png?width=1200';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  return (
    <div className='p-5 h-100 bg-white'>
      <Grid container spacing={3} className='h-100'>
        <div className='d-flex justify-content-center align-items-center w-100'>
          <Grid item xs={10} className='d-flex align-items-center justify-content-center'>
                <img alt='logo' src={signUpImg} style={{width:'80%', height:'80%'}}/>
          </Grid>
          <Grid item xs={3}>
            <form className='app-form'>
                <img className='img-header' alt='logo' src={instaLogo}/>
                <Input type='text' placeholder='username' value={username} onChange={(e) => setUsername(e.target.value)}/>
                <Input type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <Input type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                <Button type='submit' onClick={() => signUp(email, password, username)}>Sign Up</Button>
            </form>
            <div className='text-center mt-2'>Already have an account ? <span role='button' className='other-option-text' onClick={() => openSignIn()}>Sign In</span></div>
          </Grid>
        </div>
      </Grid>
    </div>
  )
}

export default Registration;
