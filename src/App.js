import { useEffect, useState, useRef } from 'react';
import './App.css';
import Posts from './Posts/Posts';
import CreatePost from './CreatePost/CreatePost';

import {db} from './firebase-config';

import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import InstagramEmbed from 'react-instagram-embed';

import { makeStyles } from '@material-ui/core/styles';
import { Button, Input } from '@material-ui/core';
import { Modal } from '@mui/material';
import MiniDrawer from './Drawerr/Drawerr';
import Drawerr from './Drawerr/Drawerr';

import Box from '@mui/material/Box';
import UserProfile from './UserProfile/UserProfile';
import Grid from '@mui/material/Grid';
import SearchUser from './SearchUser/SearchUser';
import Messaging from './Messaging/Messaging';
import { useDispatch, useSelector } from 'react-redux';
import CreateStory from './CreateStory/CreateStory';
import { checkIfStoryExists, establishUserConnection, getAllFollowing, getUser, listenInComingCall, setUserStatus, rejectCall, getPosts } from './Utils';
import AvatarStory from './ViewStory/AvatarStory';
import Login from './Authentication/Login';
import Registration from './Authentication/Registration';
import Call2 from './Call/Call2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


import {ContextProvider} from './Context/SocketContext';
import Sidebar from './Call/Sidebar';
import Notifications from './Call/Notifications';
import GroupCall from './Call/GroupCall';
import PreCall from './Call/PreCall';
import { Avatar } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
import {Provider} from 'react-redux';



function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

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

const useStyles4 = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 800,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5]
  },
}));

const useStyles5 = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    height: 600,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5]
  },
}));


function App() {
  const instaLogo = 'https://www.logo.wine/a/logo/Instagram/Instagram-Wordmark-Black-Logo.wine.svg';
  
  const currView = useSelector((state) => state.view);
  const metaData = useSelector((state) => state.metaData);
  const [currScreenSize, setScrSize] = useState(window && window.innerWidth);
  
  // modal styles
  const classes2 = useStyles2();
  const classes3 = useStyles5();
  const classes4 = useStyles4();

  const [modalStyle] = useState(getModalStyle);
  // modal set close/open
  const [open, setOpen] = useState(false);
  
  const [posts, setPosts] = useState([]);
  

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [preCall, setPreCall] = useState(false);
  const [incomingCall, setInComingCallData] = useState();
  const [outgoingCall, setOutGoingCallData] = useState();

  const [allFollowing, setAllFollowing] = useState([]);

  // sign In vars
  const [openSignIn, setOpenSignIn] = useState(undefined);
  const [errorText, setError] = useState(undefined);

  // current view
  // const [currentView, setCurrentView] = useState("POSTS");
  const listInnerRef = useRef();
  const [lastPostKey, setLastPostKey] = useState(0);

  // current user
  const [user, setUser] = useState(null);

  // run code on change of dependency (the second param)
  useEffect(() => {
    // fetch posts for first time
    fetchPosts(0);

    window.addEventListener('resize', (event) => {
      if(event && event.target && event.target.innerWidth)
        setScrSize(event.target.innerWidth);
    }, true);
  }, []);

  const fetchPosts = async (afterPostId) => {
    // giff - true
    if(afterPostId) {
      const posts = await getPosts(afterPostId);
      // fetch newer paginated posts array from firebase db
      if(lastPostKey.id !== posts.docs.slice(-1)[0])
        setLastPostKey(posts.docs.slice(-1)[0]);
      else  setLastPostKey(undefined);  //it means all ids are fetched
      setPosts((prev) => ([ ...prev, ...posts.docs.map(doc => ({
        id: doc.id,
        post:doc.data()
      }))]));
      // giff = false
    } else if(afterPostId === 0) {  // first time post fetch
      const posts = await getPosts(); 
      // set posts array from firebase db
      setLastPostKey(posts.docs.slice(-1)[0]);
      setPosts(posts.docs.map(doc => ({
        id: doc.id,
        post:doc.data()
      })));
      // giff = false  
    }
  }

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
        setOpenSignIn(false);

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
              // listen incoming calls for this user
              listenInComingCall({
                ...authUser,
                ...docSnap.data()
              }, setInComingCallData);
    
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
        setOpenSignIn(true);
      }
    });

    return () => {
      // cleanup
      // so that, on another app refresh, this listener gets dumped
      unSubs();
    }
  }, [user]);

  //sign up logic
  const signUp = (email, password, username) => {
    setError(undefined);
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
        
      setOpen(false);
      return updateProfile(userCredential.user, {
        displayName: username
      })
      // ...
    })
    .catch((error) => {
      const errorMessage = error.code === "auth/email-already-in-use" ? "User already exists, please try login" : error.message;    
      setError(errorMessage);
    });
  }

  // sign out logic
  const signOutApp = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("USer logout successful");
      setOpenSignIn(true);
    }).catch(err => {
      console.error(err);
      setError("Error while sign up, please use valid credentials");
    });
  }

  // sign In logic
  const signIn = (email, password) => {
    setError(undefined);
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password) // email and password are from this.state
    .then(data => {
      setOpenSignIn(false);
    })
    .catch((error) => {
      console.log(error);
      setError("Invalid credentials");
      // alert("Invalid credentials", error);
    });

  }

  // change view
  useEffect(() => {
    if(currView === "CREATEPOST") {
      setShowCreatePost(true);
    } else if(currView === "STORY") {
      setShowCreateStory(true);
    } else if(currView === "CALL") {
      setPreCall(true);
      setOutGoingCallData(metaData);
      setInComingCallData(undefined);
    } else if(metaData && metaData.call === "END") {
      setPreCall(false);
      setInComingCallData(undefined);
      setOutGoingCallData(undefined);
    }
    else {
      updateUserDetails();
    }
  }, [currView, metaData]);

  useEffect(() => {
    console.log("View change ?", currView);
  }, [currView]);


  useEffect(() => {
    if(incomingCall) {
      // setting incoming call metadata
      setOutGoingCallData(undefined);
    }
  }, [incomingCall]);

  useEffect(() => {
    if(open || openSignIn)
      setError(undefined);
  }, [open, openSignIn])

  const cancelCall = () => {
    setInComingCallData(undefined);
    if(incomingCall && user)
      rejectCall(incomingCall.otherUser?.uid, user.uid);
    // also delete from db, and inform 'from' user
  }

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      if (scrollTop + clientHeight + 10 >= scrollHeight) {  // 10 is an offset to prevent exact values check
        // TO SOMETHING HERE
        console.log('Reached bottom')
        fetchPosts(lastPostKey);
      }
    }
  };

  return (
      <>
        {!preCall  ? <div className={(currScreenSize < 767 ? 'mobile-screen' : '') + " app"}>
          {/* app header */}
          {openSignIn === false && !open && <div className='app-header'>
            <img src={instaLogo} alt='logo' className='img-header'></img>
            {
              user ? 
              <Button onClick={() => signOutApp()}>Logout</Button> : 
              <div className='app-login-container'>
                <Button onClick={() => setOpen(true)}>Sign Up</Button>
                <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
              </div>
            }
          </div>  }

          {/* Sign up page */}
          {open && <Registration signUp={signUp}  error={errorText} openSignIn={() => {setOpen(false); setOpenSignIn(true)}} />}

          {/* sign In page */}
          {openSignIn && <Login signIn={signIn} error={errorText} openSignUp={() => {setOpen(true); setOpenSignIn(false)}} />}
          
          {openSignIn === false && !open && <div className='main-app'>
            <Box sx={{ display: 'flex' }}>
            <Drawerr/>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              {(currView === "CREATEPOST" || currView === "POSTS" || currView === "STORY") && 
                <div className='app-posts flex flex-col items-center w-100' onScroll={() => onScroll()} ref={listInnerRef}>
                  {/* all stories */}
                  {
                    user && user.uid && allFollowing && allFollowing.length ? 
                      <div className='d-flex w-full overflow-x-auto all-user-stories xl:pb-1 lg:pb-1 md:pb-1' style={{'max-width' :'500px'}}> 
                        {allFollowing.map(userInfo => (
                          <div>
                            <AvatarStory size={50} user={userInfo} currentUserId={user.uid} dontShowAvatar={true} showName={true}/>
                          </div>))} 
                      </div> : null
                  }
                  {
                    posts && posts.length ? posts.map(({id, post}) => (
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
                    )) : null
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
                  <div style={modalStyle} className={classes4.paper}>
                    <div className='xs:block lg:hidden xl:hidden md:hidden p-2'><ArrowBackIcon onClick={() => setShowCreatePost(false)} /></div>
                    <CreatePost user={user} close={() => setShowCreatePost(false)} />
                  </div>
                </Modal>}
              {/* create story modal*/}
              {showCreateStory && user?.displayName && <Modal open={showCreateStory}
                onClose={() => setShowCreateStory(false)}>
                  <div style={modalStyle} className={classes3.paper}>
                    <div className='xs:block lg:hidden xl:hidden md:hidden p-2'><ArrowBackIcon onClick={() => setShowCreateStory(false)} /></div>
                    <CreateStory user={user} close={() => setShowCreateStory(false)}/>
                  </div>
                </Modal>}
              {(currView === "CREATEPOST" || currView === "STORY" || currView === "TEST_VIDEO") &&
              <> 
                <GroupCall />
              </> }
              
            </Box>
                </Box>
          </div>}
          
        </div> : <div  className={(currScreenSize < 767 ? 'mobile-screen' : '')}><PreCall closeCall={() => setPreCall(false)} data={outgoingCall || incomingCall}  /></div>}
        {incomingCall && !preCall && 
          <Modal open={!!incomingCall}>
            <div style={modalStyle} className={classes2.paper}>
              <div className='h-100 d-flex align-items-center flex-column justify-content-center'>
                <Avatar sx={{width: 100, height: 100}}  alt={incomingCall.otherUser.displayName} src={incomingCall.otherUser.imgUrl}/>
                <h4 className="p-2">{incomingCall.otherUser.displayName}</h4>
                <span>incoming {incomingCall.callType === "VOICE" ? 'audio' :'video'} call...</span>
                <div className='d-flex align-items-center justify-content-center'>
                  <div className='p-2'>
                    <CallIcon role="button" onClick={() => setPreCall(true)} />
                  </div>
                  <div className='p-2'>
                    <CloseIcon role="button" onClick={() => cancelCall()} />
                  </div>
                </div>
              </div>
            </div>
          </Modal>}
      </>
  );
}

export default App;
