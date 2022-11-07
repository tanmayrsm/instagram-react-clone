import React, { useEffect, useState } from 'react'
import './Posts.css';
import { Avatar } from '@material-ui/core';
import {db} from '../firebase-config';
import { Button } from '@material-ui/core';
import { serverTimestamp } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import {getUser} from "../Utils";

function Posts({postId, user, username, imgUrl, caption, userWhoPosted}) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState([]);
  const [postUserDetails, setPostUserDetails] = useState(null);

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
                         return {...data, userDp: userData.imgUrl, userDisplayName: userData.displayName}
                      })
                    })
                    Promise.all(promises).then((results) => {
                        setComments(results);
                    });
                  });
    }
    return () => {
      unSubs();
    }
  }, [postId]);

  useEffect(() => {
    console.log("Comments received ::", comments);
  }, [comments]);

  // get particular posts, user details
  useEffect(() => {
    if(user !== null && userWhoPosted && db.collection('user').doc(userWhoPosted) != null) {
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
    db.collection('posts').doc(postId).collection('comments').add({
      username: user.displayName,
      uid: user.uid,
      text: comment,
      timestamp: serverTimestamp()
    });
    setComment('');
  }

  return (
    <div className='post'>
        <div className='post-header'>
            <Avatar className='post-avatar' alt={username} src={postUserDetails?.imgUrl || 'dnsj.com'}/>
            <h3>{postUserDetails?.displayName || username}</h3>
        </div>
      <img src={imgUrl} alt='post' className='post-image'></img>
      <h4 className='post_text'><strong>{postUserDetails?.displayName || username}</strong>: {caption}</h4>

      {/* list of comments */}
      <div className='post-comments'>
        <hr/>
        {
              comments && comments.length && comments.map(({userDisplayName, userDp, text, timestamp}) => (
                <div key={timestamp} className="d-flex align-items-center mb-2">
                  <Avatar className='post-avatar' alt={userDisplayName || 'UNKNOWN USER'} src={userDp || 'dnsj.com'}/>
                  <div className='mr-2'><strong>{userDisplayName || 'UNKNOWN USER'}</strong> {text}</div>
                </div>
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
