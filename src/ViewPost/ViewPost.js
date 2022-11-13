import { Avatar, Button, Grid } from '@mui/material';
import React from 'react'
import { useState, useEffect } from 'react';
import Carousel from 'react-material-ui-carousel';
import './ViewPost.css';
import {db} from '../firebase-config';
import {getUser} from "../Utils";
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import MapsUgcOutlinedIcon from '@mui/icons-material/MapsUgcOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { serverTimestamp } from "firebase/firestore";


function ViewPost({postId, currentUser, username, media, caption, userWhoPosted, timestamp, likes, tags, saved, postUserDetails}) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState([]);
  const [liked, setLiked] = useState(false);
  const [postSaved, setPostSaved] = useState(false);

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
    if(likes && likes.includes(currentUser.uid)){
      setLiked(true);
    }
    if(saved && saved.includes(currentUser.uid)){
      setPostSaved(true);
    }
    return () => {
      unSubs();
    }
  }, [postId]);

  const addComment = () => {
    db.collection('posts').doc(postId).collection('comments').add({
      username: currentUser.displayName,
      uid: currentUser.uid,
      text: comment,
      media: media,
      timestamp: serverTimestamp(),
      likes: likes,
      tags: tags,
      saved: saved
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
    <Grid container spacing={2}>
        <Grid item xs={5}>
        {
          media && media.length > 0 &&
            
              <Carousel sx={{width: '25em', height: '20em'}} className={'w-100 d-flex justify-content-center align-items-center flex-column carousel-container h-100' + (media.length === 1 ? ' no-buttons' : '')} autoPlay={false} indicators={!(media.length === 1)}>
                  {media.map((file_, index_) => (
                      <div className='post-content' key={index_}>
                          {(file_.fileType === 'image/jpeg' || file_.fileType === 'image/webp') && <img src={file_.url} alt='post-img'/>}
                          {file_.fileType === 'video/mp4' && <video alt='post-video' src={file_.url} controls/>}
                      </div>
                  ))}
              </Carousel>
      }
        </Grid>
        <Grid item xs={7}>
          <div>
            <div className='post-header'>
              <Avatar className='post-avatar' alt={username} src={postUserDetails?.imgUrl || 'dnsj.com'}/>
              <h6 className='mb-0'>{postUserDetails?.displayName || username}</h6>
            </div>
            <hr/>
            {/* post caption */}
            <div className='d-flex'>
              <Avatar className='post-avatar' alt={username} src={postUserDetails?.imgUrl || 'dnsj.com'}/>
                <h6 className='post_text'><strong>{postUserDetails?.displayName || username}</strong>: {caption}</h6>
            </div>
            {/* comments list */}
            <div className='view-comments'>
            {
                  comments && comments.length && comments.map(({userDisplayName, userDp, text, timestamp}) => (
                    <div key={timestamp} className="d-flex align-items-center mb-2">
                      <Avatar className='post-avatar' alt={userDisplayName || 'UNKNOWN USER'} src={userDp || 'dnsj.com'}/>
                      <div className='mr-2'><strong>{userDisplayName || 'UNKNOWN USER'}</strong> {text}</div>
                    </div>
                  ))
            }
            </div>
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
            
            {/* add comment */}
            {
              currentUser && <form className='post-comment'>
                <input type='text' className='post-comment-text' placeholder='Enter comment...' value={comment} onChange={(event) => setComment(event.target.value)} />
                <Button onClick={addComment} className='post-comment-btn'>Post</Button>
              </form>
            }
          </div>
        </Grid>
    </Grid>
  )
}

export default ViewPost;
