import { Avatar, Button, Grid, Modal } from '@mui/material';
import React from 'react'
import { useState, useEffect } from 'react';
import Carousel from 'react-material-ui-carousel';
import './ViewPost.css';
import {db} from '../firebase-config';
import {deletePost, getUser, getTimeAgo} from "../Utils";
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import MapsUgcOutlinedIcon from '@mui/icons-material/MapsUgcOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { serverTimestamp } from "firebase/firestore";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CreatePost from '../CreatePost/CreatePost';
import { getModalStyle, useStyles } from '../stylesUtil';
import DeleteIcon from '@mui/icons-material/Delete';


function ViewPost({postId, userUidWhoPosted, currentUser, username, media, caption, userWhoPosted, timestamp, likes, tags, saved, close}) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState([]);
  const [commentKeys, setCommentKeys] = useState([]);
  const [liked, setLiked] = useState(false);
  const [postSaved, setPostSaved] = useState(false);
  const [editPost, setEditPost] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [viewAllReplies, setViewReplies] = useState(null);
  const [userWhoReplies, setUserWhoReplies] = useState({});
  const [postUserDetails, setPostUserDetails] = useState(null);

  useEffect(() => {
    getUser(userUidWhoPosted).then(data => {
      setPostUserDetails(data);
    });
  }, [userUidWhoPosted])

  const classes = useStyles();

  const [modalStyle] = useState(getModalStyle());

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
                    setCommentKeys(snapshot.docs.map(doc => doc.id));
                    var promises = commentsData.map((data, index) => {
                      if(data.replies && data.replies.length > 0) {
                        data.replies.map(data => getUser(data.key).then(data => {
                          setUserWhoReplies(prev => ({...prev, [data.uid] : data}));
                        }));
                        
                      }
                      return getUser(data.uid).then((userData) => {
                         return userData && {...data, userDp: userData.imgUrl, userDisplayName: userData.displayName}
                      })
                    })
                    Promise.all(promises).then((results) => {
                      if(results) {
                        console.log("All comments ::", results);
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
    if(!replyTo) {
      const timeSt = Date.now();
      db.collection('posts').doc(postId).collection('comments').add({
        username: currentUser.displayName,
        uid: currentUser.uid,
        text: comment,
        timestamp: timeSt,
        likes: {},
        replies: []
      });
    } else {
      const replyList = comments[replyTo.idx].replies || [];
      const ts = Date.now();
      db.collection('posts').doc(postId).collection('comments').doc(commentKeys[replyTo.idx]).set({
        ...comments[replyTo.idx], replies: [...replyList, {key: currentUser.uid, value : comment, timestamp:ts}]
      });
    }
    setComment('');
    setReplyTo(null);
  }

  useEffect(() => {
    if(comments && comments.length > 0) {
      if(viewAllReplies === null) {
        comments.map((comment, index) => {
          if(comment.replies && !viewAllReplies) {
            setViewReplies(prev => ({...prev, [index]:'closed'}));
          }
        })
      }
    }
  }, [comments]);

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

  const deleteCurrentPost = () => {
    deletePost(postId).then(() => {
      close();
    });
  }

  const likeComment = (commentIndex) => {
    const likeList = comments[commentIndex].likes;
    db.collection('posts').doc(postId).collection('comments').doc(commentKeys[commentIndex]).set({
      ...comments[commentIndex], likes: {...likeList, [currentUser.uid] : true}
    });
  }

  const unLikeComment = (commentIndex) => {
    const likeList = comments[commentIndex].likes;
    db.collection('posts').doc(postId).collection('comments').doc(commentKeys[commentIndex]).set({
      ...comments[commentIndex], likes: {...likeList, [currentUser.uid] : false}
    });
  }


  const toggleReply = (index) => {
    const replyList = {...viewAllReplies, [index]: viewAllReplies[index] === 'closed' ? 'open' : 'closed'};
    setViewReplies(replyList);
  }

  const deleteComment = (id) => {
    db.collection('posts').doc(postId).collection('comments').doc(id).delete();
  }

  const deleteNestedComment = (commentId, commentIndex, replyIndex) => {
    const prevReplies = comments[commentIndex].replies;
    prevReplies.splice(replyIndex, 1);
    db.collection('posts').doc(postId).collection('comments').doc(commentId).set({
      ...comments[commentIndex], replies : [...prevReplies]
    });
  }


  return (
    <>
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
              <div className='view-post-header align-items-center'>
                <div className='d-flex align-items-center'>
                  <Avatar className='post-avatar' alt={username} src={postUserDetails?.imgUrl || 'dnsj.com'}/>
                  <h6 className='mb-0'>{postUserDetails?.displayName || username}</h6>
                </div>
                {postUserDetails && (currentUser.uid === postUserDetails.uid) && <div>
                  <ModeEditIcon role="button" onClick={() => setEditPost(true)}/>
                  <DeleteIcon role="button" onClick={() => deleteCurrentPost()} />
                </div>}
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
                    comments && comments.length > 0 && comments.map(({userDisplayName, userDp, text, timestamp, uid, likes, replies}, index) => (
                      <div className='' key={commentKeys[index]}>
                        <div key={timestamp} className="d-flex align-items-center mb-2">
                          <Avatar className='post-avatar' alt={userDisplayName || 'UNKNOWN USER'} src={userDp || 'dnsj.com'}/>
                          <div className='mr-2'><strong>{userDisplayName || 'UNKNOWN USER'}</strong> {text}</div>
                          <div role="button">{likes && likes[currentUser.uid] ? <FavoriteOutlinedIcon onClick={() => unLikeComment(index)}/> : <FavoriteBorderOutlinedIcon onClick={() => likeComment(index)}/>}</div>
                        </div>
                        {timestamp && <div className='d-flex'>
                          {/* time */}
                          <div>{getTimeAgo(timestamp)}</div>
                          {/* no of likes */}
                          {likes && Object.values(likes).filter(val => !!val).length > 0 && <div style={{'marginLeft': '1em'}}> {Object.values(likes).filter(val => !!val).length} likes</div>}
                          {/* reply to comment */}
                          <div role="button" style={{'marginLeft': '1em'}} onClick={() => {setComment('@' + userDisplayName); setReplyTo({id : uid, idx: index})}}>Reply</div>
                          {/* delete comment */}
                          {uid === currentUser.uid && <div role="button" style={{'marginLeft': '1em'}} onClick={() => deleteComment(commentKeys[index])}>Delete</div>}
                        </div>}
                        {/* comment replies */}
                        { replies && replies.length > 0 && viewAllReplies && viewAllReplies[index] !== undefined ? 
                          <div role="button" className='view-replies'>
                            {viewAllReplies[index] === 'closed' ? 
                              <div onClick={() => toggleReply(index)}>View all replies</div> : 
                              <div>
                                <div onClick={() => toggleReply(index)}>Hide all replies</div>
                                {userWhoReplies && replies.map((data, replyIndex) => 
                                  <div>
                                    <div className='d-flex ml-3 align-items-center w-100'>
                                        <Avatar className='post-avatar' alt={(userWhoReplies[data.key] && userWhoReplies[data.key].displayName) || 'UNKNOWN USER'} src={(userWhoReplies[data.key].imgUrl) || 'dnsj.com'}/>
                                        <div className='mr-2'><strong>{(userWhoReplies[data.key] && userWhoReplies[data.key].displayName) || 'UNKNOWN USER'}</strong> {data.value}</div>
                                    </div>   
                                    <div className='d-flex'>
                                      <div>{getTimeAgo(data.timestamp)}</div>
                                      <div style={{'marginLeft': '1em'}} onClick={() => {setComment('@' + userWhoReplies[data.key].displayName); setReplyTo({id : uid, idx: index})}}>Reply</div>
                                      {userWhoReplies[data.key].uid === currentUser.uid && <div onClick={() => deleteNestedComment(commentKeys[index], index, replyIndex)} role="button" style={{'marginLeft': '1em'}}>Delete</div>}
                                    </div>
                                  </div>
                              )}
                              </div>
                            }
                          </div> : ''}
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
          <Modal open={editPost}
              onClose={() => setEditPost(false)}>
                <div style={modalStyle} className={classes.paper}>
                  {editPost && <CreatePost user={currentUser} postId={postId} close={() => setEditPost(false)} />}
                </div>
          </Modal>
      </Grid>
    </>
  )
}

export default ViewPost;
