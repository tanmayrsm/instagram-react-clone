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
import SearchUser from './SearchUser/SearchUser';
import Messaging from './Messaging/Messaging';
import { useDispatch, useSelector } from 'react-redux';
import CreateStory from './CreateStory/CreateStory';
import { checkIfStoryExists, establishUserConnection, getAllFollowing, getUser, setUserStatus } from './Utils';
import AvatarStory from './ViewStory/AvatarStory';


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

const useStyles2 = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 800,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const useStyles3 = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    height: 600,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));


function App() {
  const instaLogo = 'https://www.logo.wine/a/logo/Instagram/Instagram-Wordmark-Black-Logo.wine.svg';
  
  const currView = useSelector((state) => state.view);
  const metaData = useSelector((state) => state.metaData);
  
  // modal styles
  const classes = useStyles();
  const classes2 = useStyles2();
  const classes3 = useStyles3();

  const [modalStyle] = useState(getModalStyle);
  // modal set close/open
  const [open, setOpen] = useState(false);
  
  const [posts, setPosts] = useState([]);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [allFollowing, setAllFollowing] = useState([]);

  // sign up fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // sign In vars
  const [openSignIn, setOpenSignIn] = useState(false);

  // current view
  // const [currentView, setCurrentView] = useState("POSTS");

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
    });
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
        if(db.collection('user').doc(authUser.uid) != null && user === null) {
          setUserStatus(authUser.uid, true);
          establishUserConnection(authUser.uid);
          const fetchDocById = async () => {
            const docRef = doc(db, "user", authUser.uid) // db = getFirestore()
      
            // Fetch document
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
              setUser({
                ...authUser,
                ...docSnap.data()
              });
              // get all following users for myself
              getAllFollowing(authUser.uid).then( (val) => {
                return Promise.all(val.map(id => getUser(id)));
              }).then(allUsers => {
                if(allUsers) {
                      setAllFollowing(allUsers);
                }
              });
            }
          }
          fetchDocById();
        }
      } else {
        if(user?.uid) {
          setUserStatus(user.uid, false);
        }
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
          username: username,
          uid: authUser.uid
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
  useEffect(() => {
    if(currView === "CREATEPOST") {
      setShowCreatePost(true);
    } else if(currView === "STORY") {
      setShowCreateStory(true);
    }
    else {
      updateUserDetails();
    }
  }, [currView, metaData]);

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
        <Drawerr/>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {(currView === "CREATEPOST" || currView === "POSTS" || currView === "STORY") && 
            <div className='app-posts'>
              {/* all stories */}
              {
                user && user.uid && allFollowing && allFollowing.length && 
                  <div className='d-flex all-user-stories'> 
                    {allFollowing.map(userInfo => (
                      <div>
                        <AvatarStory user={userInfo} currentUserId={user.uid} dontShowAvatar={true} showName={true}/>
                      </div>))} 
                  </div>
              }
              {
                posts && posts.length && posts.map(({id, post}) => (
                  <Posts key={id} 
                    postId={id} 
                    currentUser={user}
                    username={post.username} 
                    media={post.media}
                    caption={post.caption}
                    userWhoPosted={post.uid}
                    timestamp={post.timestamp}
                    likes={post.likes}
                    tags={post.tags}
                    saved={post.saved}/>
                ))
              }
              {
                user?.displayName ? 
                  "" :
                  <h4>Please login to uplaod posts!!</h4>
              }
            </div>
          }
          {/* profile view */}
          {user && (currView === "CREATEPOST" || currView === "STORY" || currView === "PROFILE") && <UserProfile user={user} currentUserId={user.uid}/>}
          {/* search user */}
          {(currView === "CREATEPOST" || currView === "STORY" || currView === "SRUSER") && <SearchUser user={user} currentUserId={user.uid}/>}
          {/* message user */}
          {(currView === "CREATEPOST" || currView === "STORY" || currView === "MESSAGING") && <Messaging currentUser={user} otherUserId={metaData?.uid}/>}
          {/* create Post modal*/}
          {showCreatePost && user?.displayName && <Modal open={showCreatePost}
            onClose={() => setShowCreatePost(false)}>
              <div style={modalStyle} className={classes2.paper}>
                <CreatePost username={user.displayName} user={user}/>
              </div>
            </Modal>}
          {/* create story modal*/}
          {showCreateStory && user?.displayName && <Modal open={showCreateStory}
            onClose={() => setShowCreateStory(false)}>
              <div style={modalStyle} className={classes3.paper}>
                <CreateStory user={user} close={() => setShowCreateStory(false)}/>
              </div>
            </Modal>}
        </Box>
            </Box>
      </div>
      
    </div>
  );
}

export default App;
