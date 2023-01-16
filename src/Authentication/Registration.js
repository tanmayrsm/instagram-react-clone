import { Button, Grid, Input } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import './Authentication.css';

function Registration({signUp, openSignIn, error}) {
  const instaLogo = 'https://www.logo.wine/a/logo/Instagram/Instagram-Wordmark-Black-Logo.wine.svg';
  const signUpImg = 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2020/08/05/11/instagram-reels.png?width=1200';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  return (
    <div className='xl:p-10 lg:p-10 sm:p-0 md:p-0 xs:p-0 h-100 bg-gray-100'>
      <Grid container spacing={2} className='h-100'>
        <div className='d-flex justify-content-center align-items-center w-100'>
          <Grid item xs={12} md={12} sm={12} lg={9} xl={8} className='relative d-flex align-items-center justify-content-center xs:h-full sm:h-full md:h-full xl:h-auto lg:h-auto' >
                <img alt='logo' src={signUpImg} style={{'height': '100%', 'object-fit': 'cover'}} className="
                xs:h-screen xs:opacity-50 sm:opacity-50 md:opacity-50 lg:opacity-100 xl:opacity-100 
                xs:max-h-screen sm:max-h-screen md:max-h-screen xl:max-h-128 lg:max-h-80"/>
          </Grid>
          <Grid item xs={12} md={12} sm={12} lg={3} xl={4} className="border border-gray-400 px-4 py-5 rounded bg-white xl:relative lg:relative md:absolute sm:absolute absolute md:w-128">
            <form className='app-form'>
                <img className='img-header m-3' alt='logo' src={instaLogo}/>
                {/* username */}
                <Input type='text' inputProps={{style: {fontSize: 15}}}  className='pt-2 text-sm' placeholder='username' value={username} onChange={(e) => setUsername(e.target.value)}/>
                
                {/* email */}
                <Input type='email' inputProps={{style: {fontSize: 15}}}  className='pt-2' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                
                {/* password */}
                <Input type='password' inputProps={{style: {fontSize: 15}}}  className='pt-2' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                
                {/* sign up button */}
                <button type='button'  disabled={!(email.length > 0 && password.length > 0 && username.length > 0)} className={((email.length > 0 && password.length > 0 && username.length > 0) ? 'bg-light-btn-clr': 'bg-blue-200 cursor-not-allowed') +  ' mt-3 p-2 text-white rounded font-semibold text-sm'} onClick={() => signUp(email, password, username)}>Sign Up</button>

                {/* error text */}
                {error && <span className='text-red-600 text-center text-xs mt-2'>{error}</span>}
            </form>
            <div className='text-center mt-2 text-sm'>Already have an account ? <span role='button' className='other-option-text' onClick={() => openSignIn()}>Sign In</span></div>
          </Grid>
        </div>
      </Grid>
    </div>
  )
}

export default Registration;
