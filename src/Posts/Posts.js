import React, { useEffect, useState } from 'react'
import './Posts.css';
import { Avatar } from '@material-ui/core';
import {db} from '../firebase-config';
import { Button } from '@material-ui/core';
import { serverTimestamp } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import {getUser} from "../Utils";
import Carousel from 'react-material-ui-carousel';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import MapsUgcOutlinedIcon from '@mui/icons-material/MapsUgcOutlined';
import { Modal } from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import ViewPost from '../ViewPost/ViewPost';
import AvatarStory from '../ViewStory/AvatarStory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    width: 800,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function Posts({postId, currentUser, username, media, caption, userWhoPosted, timestamp, likes, tags, saved}) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState([]);
  const [postUserDetails, setPostUserDetails] = useState(null);
  const [liked, setLiked] = useState(false);
  const [postSaved, setPostSaved] = useState(false);
  const [viewDetailedPost, setViewDetailedPost] = useState(false);

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  

  // get all comments for this post
  useEffect(() => {
    let unSubs;
    if(postId) {
      unSubs = db.collection('posts')
                  .doc(postId)
                  .collection('comments')
                  .orderBy('timestamp', 'desc')
                  .onSnapshot((snapshot) => {
                    let commentsData = snapshot.docs.map(doc => doc.data());
                    var promises = commentsData.map((data) => {
                      return getUser(data.uid).then((userData) => {
                         return userData && {...data, userDp: userData.imgUrl, userDisplayName: userData.displayName}
                      })
                    })
                    Promise.all(promises).then((results) => {
                      if(results) {
                        setComments(results);
                      }
                    });
                  });
    }
    if(currentUser) {
      if(likes && likes.includes(currentUser.uid)){
        setLiked(true);
      }
      if(saved && saved.includes(currentUser.uid)){
        setPostSaved(true);
      }
    }
    return () => {
      unSubs();
    }
  }, [postId]);


  // get particular posts, user details
  useEffect(() => {
    if(currentUser !== null && userWhoPosted && db.collection('user').doc(userWhoPosted) != null) {
      const fetchDocById = async () => {
        const docRef = doc(db, "user", userWhoPosted);
  
        // Fetch document
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setPostUserDetails(docSnap.data());
        }
      }
      fetchDocById();
    }
  }, [])

  const addComment = () => {
    const timeSt = Date.now();
    db.collection('posts').doc(postId).collection('comments').add({
      username: currentUser.displayName,
      uid: currentUser.uid,
      text: comment,
      timestamp: timeSt,
      likes: {},
      replies: []
    });
    setComment('');
  }

  const toggleLike = (stateToggle) => {
    setLiked(!liked);
    if(stateToggle) {
      likes.push(currentUser.uid);
    } else {
      likes = likes.filter(uid => uid !== currentUser.uid);
    }
    db.collection('posts').doc(postId).set({
      username: postUserDetails.displayName,
      uid: postUserDetails.uid,
      text: comment,
      media: media,
      timestamp: timestamp,
      likes: likes,
      tags: tags,
      saved: saved,
      caption: caption
    });
  }

  const toggleSaved = (stateToggle) => {
    setPostSaved(!postSaved);
    if(stateToggle) {
      saved.push(currentUser.uid);
      db.collection('user').doc(currentUser.uid).collection('saved').doc(postId).set({[postId]: true});
    } else {
      saved = saved.filter(uid => uid !== currentUser.uid);
      db.collection('user').doc(currentUser.uid).collection('saved').doc(postId).delete();
    }
    db.collection('posts').doc(postId).set({
      username: postUserDetails.displayName,
      uid: postUserDetails.uid,
      text: comment,
      media: media,
      timestamp: timestamp,
      likes: likes,
      tags: tags,
      saved: saved,
      caption: caption
    });
  }

  return (
    <div className='post rounded-lg xs:rounded-none'>
        <div className='post-header'>
          {postUserDetails && currentUser && <AvatarStory user={postUserDetails} currentUserId={currentUser.uid}/>}
            <h6 className='mb-0'>{postUserDetails?.displayName || username}</h6>
        </div>
      {
          media && media.length > 0 &&
            
              <Carousel sx={{width: '25em', height: '25em'}} className={'w-100 d-flex justify-content-center align-items-center flex-column carousel-container' + (media.length === 1 ? ' no-buttons' : '')} autoPlay={false} indicators={!(media.length === 1)}>
                  {media.map((file_, index_) => (
                      <div className='h-100 w-100' key={index_}>
                          {(file_.fileType === 'image/jpeg' || file_.fileType === 'image/webp') && <img className='post-media h-100 w-100' src={file_.url} alt='post-img'/>}
                          {file_.fileType === 'video/mp4' && <video alt='post-video' className='post-media h-100 w-100' src={file_.url} controls/>}
                      </div>
                  ))}
              </Carousel>
      }
      {/* like, comment, save post icons */}
      <div className='d-flex align-items-center post_text justify-content-between icon-container'>
        <div className='d-flex justify-content-between'>
          <div>
            {!liked ? <FavoriteBorderOutlinedIcon onClick={() => toggleLike(true)}/> : <FavoriteOutlinedIcon  onClick={() => toggleLike(false)}/>}
          </div>
        </div>
        <div>
        {!postSaved ? <BookmarkBorderOutlinedIcon onClick={() => toggleSaved(true)}/> : <BookmarkOutlinedIcon  onClick={() => toggleSaved(false)}/>}
        </div>
      </div>
      <div className='fw-bold post_text'>{likes && likes.length} likes</div>
      <h6 className='post_text'><strong>{postUserDetails?.displayName || username}</strong>: {caption}</h6>

      {comments && comments.length && <div role="button" className='post_text text-gray-500' onClick={() => setViewDetailedPost(true)}>View all {comments && comments.length} comments</div>}
      {/* list of comments */}
      <Modal open={viewDetailedPost}
        onClose={() => setViewDetailedPost(false)}>
        <div style={modalStyle} className={classes.paper}>
          <div className='xs:block lg:hidden xl:hidden md:hidden p-2'><ArrowBackIcon onClick={() => setViewDetailedPost(false)} /></div>
          <ViewPost 
            postId={postId} 
            currentUser={currentUser}
            userUidWhoPosted={userWhoPosted}
            username={username} 
            media={media}
            caption={caption}
            userWhoPosted={userWhoPosted}
            timestamp={timestamp}
            likes={likes}
            tags={tags}
            saved={saved}
            postUserDetails={postUserDetails}
            comments={comments}
            close={() => setViewDetailedPost(false)}
          />
        </div>
      </Modal>
      
      {/* add comment */}
      {
        currentUser && <form className='post-comment'>
          <input type='text' className='bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-t-none rounded-lg focus:ring-blue-500 xs:rounded-none focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' placeholder='Enter comment...' value={comment} onChange={(event) => setComment(event.target.value)} />
          {comment && comment.length > 0 ? <button onClick={addComment} className='font-semibold text-blue-400 px-2'>Post</button> : null}
        </form>
      }
      
    </div>
  )
}

export default Posts;
