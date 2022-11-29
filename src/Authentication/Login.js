import { Button, Grid, Input } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import './Authentication.css';

function Login({signIn, openSignUp}) {
  const instaLogo = 'https://www.logo.wine/a/logo/Instagram/Instagram-Wordmark-Black-Logo.wine.svg';
  const signInImg = 'https://imageio.forbes.com/specials-images/imageserve/5fac4edfacc6b52b3dbbdfb5/instagram-reels/960x0.jpg?format=jpg&width=960';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className='p-5 h-100 bg-white'>
      <Grid container spacing={3} className='h-100'>
        <div className='d-flex justify-content-center align-items-center w-100'>
          <Grid item xs={10}>
                <img alt='logo' src={signInImg}/>
          </Grid>
          <Grid item xs={3}>
              <form className='app-form'>
                <img className='img-header' alt='logo' src={instaLogo}/>
                <Input type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <Input type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                <Button type='submit' className='mt-2 btn-auth' onClick={() => signIn(email, password)}>Sign In</Button>
              </form>
            <div className='text-center mt-2'>Don't have an account ? <span role='button' className='other-option-text' onClick={() => openSignUp()}>Sign up</span></div>
          </Grid>
        </div>
      </Grid>
    </div>
  )
}

export default Login;
