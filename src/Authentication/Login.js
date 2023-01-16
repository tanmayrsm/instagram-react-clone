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
    <div className='xl:p-10 lg:p-10 sm:p-0 md:p-0 xs:p-0 h-100 bg-gray-100'>
      <Grid container spacing={3} className='h-100'>
        <div className='d-flex justify-content-center align-items-center w-100'>
          <Grid item xs={12} md={12} sm={12} lg={9} xl={8} className='relative d-flex align-items-center justify-content-center xs:h-full sm:h-full md:h-full xl:h-auto lg:h-auto' >
                <img alt='logo' src={signInImg} style={{'height': '100%', 'object-fit': 'cover'}} className="
                xs:h-screen xs:opacity-50 sm:opacity-50 md:opacity-50 lg:opacity-100 xl:opacity-100  
                xs:max-h-screen sm:max-h-screen md:max-h-screen xl:max-h-128 lg:max-h-80"/>
          </Grid>
          <Grid item xs={12} md={12} sm={12} lg={3} xl={4} className="border border-gray-400 px-4 py-5 rounded bg-white xl:relative lg:relative md:absolute sm:absolute absolute md:w-128">
              <form className='app-form'>
                <img className='img-header m-3' alt='logo' src={instaLogo}/>
                <Input inputProps={{style: {fontSize: 15}}} type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <Input inputProps={{style: {fontSize: 15}}} type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                <button type='submit' className='mt-3 p-2 bg-light-btn-clr text-white rounded font-semibold text-sm' onClick={() => signIn(email, password)}>Sign In</button>
              </form>
            <div className='text-center mt-2 text-sm'>Don't have an account ? <span role='button' className='other-option-text' onClick={() => openSignUp()}>Sign up</span></div>
          </Grid>
        </div>
      </Grid>
    </div>
  )
}

export default Login;
