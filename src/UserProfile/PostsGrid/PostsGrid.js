import React from 'react'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useEffect } from 'react';
import {db} from '../../firebase-config';
import { useState } from 'react';
import './PostsGrid.css';
import { makeStyles } from '@material-ui/core/styles';
import { Modal } from '@mui/material';
import ViewPost from '../../ViewPost/ViewPost';
import { getUser } from '../../Utils';

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


function PostsGrid({user, currentUserId}) {
      const [allPosts, setAllPosts] = useState([]);
      const [activePost, setActivePost] = useState(null);
      const classes = useStyles();
      const [modalStyle] = useState(getModalStyle);
      const [currentUser,setCurrentUser] = useState(null);

      useEffect(() => {
        getUser(currentUserId).then((userData) => 
        db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            // set posts array from firebase db
            setAllPosts(
                snapshot.docs
                .map(doc => ({
                        postId: doc.id,
                        uid: doc.data().uid,
                        imgUrl:doc.data().media[0].url,
                        title: 'Post by ' + doc.data().username,
                        currentUser: userData,
                        username:userData.username, 
                        media:doc.data().media,
                        caption:doc.data().caption,
                        userWhoPosted:user,
                        timestamp:doc.data().timestamp,
                        likes:doc.data().likes,
                        tags:doc.data().tags,
                        saved:doc.data().saved,
                        postUserDetails:user,
                        comments:doc.data().comments
                    })
                ).filter(post => post.uid === user.uid)
            );
          }))
      }, []);

  return (
    <div>
      <ImageList cols={5}>
      {allPosts && allPosts.length && allPosts.map((item) => (
        <ImageListItem key={item.postId} className='post-img' onClick={() => setActivePost(item)}>
          <img
            src={item.imgUrl}
            alt={item.title}
            loading="lazy"
          />
        </ImageListItem>
      ))}
      {
        ((allPosts.length) === 0) ? <p>No posts yet!</p> :''
      }
    </ImageList>
    {activePost && 
      <Modal open={!!activePost}
      onClose={() => setActivePost(null)}>
      <div style={modalStyle} className={classes.paper}>
        <ViewPost 
          postId={activePost.postId} 
          currentUser={activePost.currentUser}
          username={activePost.username} 
          media={activePost.media}
          caption={activePost.caption}
          userWhoPosted={activePost.userWhoPosted}
          timestamp={activePost.timestamp}
          likes={activePost.likes}
          tags={activePost.tags}
          saved={activePost.saved}
          postUserDetails={activePost.postUserDetails}
          comments={activePost.comments}
        />
      </div>
    </Modal>
    }
    </div>
  )
}

export default PostsGrid;
