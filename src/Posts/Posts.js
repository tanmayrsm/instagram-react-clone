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
      timestamp: timeSt
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
    } else {
      saved = saved.filter(uid => uid !== currentUser.uid);
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
    <div className='post'>
        <div className='post-header'>
          {postUserDetails && currentUser && <AvatarStory user={postUserDetails} currentUserId={currentUser.uid}/>}
            <h6 className='mb-0'>{postUserDetails?.displayName || username}</h6>
        </div>
      {
          media && media.length > 0 &&
            
              <Carousel sx={{width: '25em', height: '20em'}} className={'w-100 d-flex justify-content-center align-items-center flex-column carousel-container' + (media.length === 1 ? ' no-buttons' : '')} autoPlay={false} indicators={!(media.length === 1)}>
                  {media.map((file_, index_) => (
                      <div className='post-content' key={index_}>
                          {(file_.fileType === 'image/jpeg' || file_.fileType === 'image/webp') && <img src={file_.url} alt='post-img'/>}
                          {file_.fileType === 'video/mp4' && <video alt='post-video' src={file_.url} controls/>}
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
          <div>
            <MapsUgcOutlinedIcon/>
          </div>
        </div>
        <div>
        {!postSaved ? <BookmarkBorderOutlinedIcon onClick={() => toggleSaved(true)}/> : <BookmarkOutlinedIcon  onClick={() => toggleSaved(false)}/>}
        </div>
      </div>
      <div className='fw-bold post_text'>{likes && likes.length} likes</div>
      <h6 className='post_text'><strong>{postUserDetails?.displayName || username}</strong>: {caption}</h6>

      {comments && comments.length && <p className='post_text' onClick={() => setViewDetailedPost(true)}>View all {comments && comments.length} comments</p>}
      {/* list of comments */}
      <Modal open={viewDetailedPost}
        onClose={() => setViewDetailedPost(false)}>
        <div style={modalStyle} className={classes.paper}>
          <ViewPost 
            postId={postId} 
            currentUser={currentUser}
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
          <input type='text' className='post-comment-text' placeholder='Enter comment...' value={comment} onChange={(event) => setComment(event.target.value)} />
          <Button onClick={addComment} className='post-comment-btn'>Post</Button>
        </form>
      }
      
    </div>
  )
}

export default Posts;
