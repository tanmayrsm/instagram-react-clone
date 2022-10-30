import React, { useEffect, useState } from 'react'
import './Posts.css';
import { Avatar } from '@material-ui/core';
import {db} from '../firebase-config';
import { Button } from '@material-ui/core';
import { serverTimestamp } from "firebase/firestore";

function Posts({postId, user, username, imgUrl, caption}) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState([]);

  // get all comments for this post
  useEffect(() => {
    let unSubs;
    if(postId) {
      unSubs = db.collection('posts')
                  .doc(postId)
                  .collection('comments')
                  .orderBy('timestamp', 'desc')
                  .onSnapshot(snapshot => {
                    setComments(snapshot.docs.map(doc => doc.data()))
                  });
    }
    return () => {
      unSubs();
    }
  }, [postId]);

  const addComment = () => {
    db.collection('posts').doc(postId).collection('comments').add({
      username: user.displayName,
      text: comment,
      timestamp: serverTimestamp()
    });
    setComment('');
  }

  return (
    <div className='post'>
        <div className='post-header'>
            <Avatar className='post-avatar' alt={username} src='dnsj.com'/>
            <h3>{username}</h3>
        </div>
      <img src={imgUrl} alt='post' className='post-image'></img>
      <h4 className='post_text'><strong>{username}</strong>: {caption}</h4>

      {/* list of comments */}
      <div className='post-comments'>
        <hr/>
        {
              comments && comments.length && comments.map(({username, text, timestamp}) => (
                <p key={timestamp}>
                  <strong>{username}</strong> {text}
                </p>
              ))
        }
      </div>
      {/* add comment */}
      {
        user && <form className='post-comment'>
          <input type='text' className='post-comment-text' placeholder='Enter comment...' value={comment} onChange={(event) => setComment(event.target.value)} />
          <Button onClick={addComment} className='post-comment-btn'>Post</Button>
        </form>
      }
      
    </div>
  )
}

export default Posts
