import { useEffect, useState } from 'react';
import './App.css';
import Posts from './Posts/Posts';
import CreatePost from './CreatePost/CreatePost';

import {db} from './firebase-config';

import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import InstagramEmbed from 'react-instagram-embed';

import { makeStyles } from '@material-ui/core/styles';
import { Button, Input, Modal } from '@material-ui/core';
import MiniDrawer from './Drawerr/Drawerr';
import Drawerr from './Drawerr/Drawerr';

import Box from '@mui/material/Box';
import UserProfile from './UserProfile/UserProfile';
import Grid from '@mui/material/Grid';


function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));


function App() {
  const instaLogo = 'https://www.logo.wine/a/logo/Instagram/Instagram-Wordmark-Black-Logo.wine.svg';
  // modal styles
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  // modal set close/open
  const [open, setOpen] = useState(false);
  
  const [posts, setPosts] = useState([]);


  // sign up fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // sign In vars
  const [openSignIn, setOpenSignIn] = useState(false);

  // current view
  const [currentView, setCurrentView] = useState("POSTS");

  // current user
  const [user, setUser] = useState(null);

  // run code on change of dependency (the second param)
  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      // set posts array from firebase db
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post:doc.data()
      })));
    })
  }, []);

  const updateUserDetails = () => {
    if(user !== null && db.collection('user').doc(user.uid) != null) {
      const fetchDocById = async () => {
        const docRef = doc(db, "user", user.uid) // db = getFirestore()
  
        // Fetch document
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setUser({
            ...user,
            ...docSnap.data()
          });
        }
      }
      fetchDocById();
    }
  }

  // login user in case he already logged in before
  useEffect(() => {
    const auth = getAuth();
    
    const unSubs = onAuthStateChanged(auth, (authUser) => {
      if(authUser) {
        // user has logged in
        console.log("user :: ",authUser);
        

        if(db.collection('user').doc(authUser.uid) != null && user === null) {
          const fetchDocById = async () => {
            const docRef = doc(db, "user", authUser.uid) // db = getFirestore()
      
            // Fetch document
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
              setUser({
                ...authUser,
                ...docSnap.data()
              });
            }
          }
          fetchDocById();
        }
      } else {
        // user has logged out
        setUser(null);
      }
    });

    return () => {
      // cleanup
      // so that, on another app refresh, this listener gets dumped
      unSubs();
    }
  }, [user, username]);

  //sign up logic
  const signUp = (event) => {
    event.preventDefault();
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password) // email and password are from this.state
    .then((userCredential) => {
      // Signed in 
      const authUser = userCredential.user;
      // also update user details in dB
        db.collection('user').doc(authUser.uid).set({
          bio: "Hi there! I'm using instagram!",
          displayName: username,
          imgUrl: "",
          username: username
        });
      return updateProfile(userCredential.user, {
        displayName: username
      })
      // ...
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });

    setOpen(false);
  }

  // sign out logic
  const signOutApp = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("USer logout successful");
    }).catch(err => {
      console.error(err);
    });
  }

  // sign In logic
  const signIn = (event) => {
    event.preventDefault();

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password) // email and password are from this.state
    .catch((error) => {
      console.log(error);
    });

    setOpenSignIn(false);
  }

  // change view
  const changeView = (view) => {
    setCurrentView(view);
    updateUserDetails();
  }

  return (
    <div className="app">
      {/* sign Up modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
         <div style={modalStyle} className={classes.paper}>
            <form className='app-form'>
                <img className='img-header' alt='logo' src={instaLogo}/>
                <Input type='text' placeholder='username' value={username} onChange={(e) => setUsername(e.target.value)}/>
                <Input type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <Input type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                <Button type='submit' onClick={signUp}>Sign Up</Button>
            </form>
          </div>
      </Modal>

      {/* sign In modal */}
      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
         <div style={modalStyle} className={classes.paper}>
            <form className='app-form'>
                <img className='img-header' alt='logo' src={instaLogo}/>
                <Input type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <Input type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                <Button type='submit' onClick={signIn}>Sign In</Button>
            </form>
          </div>
      </Modal>

      <div className='app-header'>
        <img src={instaLogo} alt='logo' className='img-header'></img>
        {
          user ? 
          <Button onClick={() => signOutApp()}>Logout</Button> : 
          <div className='app-login-container'>
            <Button onClick={() => setOpen(true)}>Sign Up</Button>
            <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
          </div>
        }
      </div>  
      
      <div className='main-app'>
        <Box sx={{ display: 'flex' }}>
        <Drawerr changeView={changeView}/>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {currentView === "POSTS" && 
            <div className='app-posts'>
              {
                posts && posts.length && posts.map(({id, post}) => (
                  <Posts key={id} 
                    postId={id} 
                    user={user}
                    username={post.username} 
                    imgUrl={post.imgUrl} 
                    caption={post.caption}/>
                ))
              }
              {
                user?.displayName ? 
                  <CreatePost username={user.displayName} user={user}/> :
                  <h4>Please login to uplaod posts!!</h4>
              }
            </div>
          }
          {/* profile view */}
          {user && currentView === "PROFILE" && <UserProfile user={user}/>}
        </Box>
            </Box>
      </div>
      
    </div>
  );
}

export default App;
