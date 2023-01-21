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


function PostsGrid({user, currentUserId, saved}) {
      const [allPosts, setAllPosts] = useState([]);
      const [activePost, setActivePost] = useState(null);
      const classes = useStyles();
      const [modalStyle] = useState(getModalStyle);
      const [viewablePostsData, setViewablePostsData] = useState([]);
      const [savedPostsId, setSavedPostsIds] = useState([]);

      useEffect(() => {
        getUser(currentUserId).then((userData) => {
            // show only users post
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
                            timestamp:doc.data().timestamp,
                            likes:doc.data().likes,
                            tags:doc.data().tags,
                            saved:doc.data().saved,
                            postUserDetails: getUser(doc.data().uid).then(data => data),
                            comments:doc.data().comments
                        })
                    )
                );
              });
          if(saved){
            // show saved post
            db.collection('user').doc(user.uid).collection('saved').onSnapshot(snapShot => {
              if(snapShot && snapShot.docs && snapShot.docs.length > 0) {
                setSavedPostsIds(snapShot.docs.map(data => data.id))
              }
            });
          }
        });
      }, []);

      useEffect(() => {
        if(allPosts) {
          if(!saved) {
            setViewablePostsData(allPosts.filter(post => post.uid === user.uid));
          } else if(savedPostsId) {
            setViewablePostsData(allPosts.filter(post => savedPostsId.includes(post.postId)));
          }
        }
      }, [allPosts, savedPostsId]);


  return (
    <div>
      <ImageList cols={5}>
      {viewablePostsData && viewablePostsData.length && viewablePostsData.map((item) => (
        <ImageListItem role="button" key={item.postId} className='post-img' onClick={() => setActivePost(item)}>
          <img
            src={item.imgUrl}
            alt={item.title}
            loading="lazy"
          />
        </ImageListItem>
      ))}
      {
        ((viewablePostsData.length) === 0) ? <p>No posts yet!</p> :''
      }
    </ImageList>
    {activePost && 
      <Modal open={!!activePost}
      onClose={() => setActivePost(null)}>
      <div style={modalStyle} className={classes.paper}>
        <div className='xs:block lg:hidden xl:hidden md:hidden mb-3'><ArrowBackIcon onClick={() => setActivePost(null)} /></div>
        <ViewPost 
          postId={activePost.postId} 
          userUidWhoPosted={activePost.uid}
          currentUser={activePost.currentUser}
          username={activePost.username} 
          media={activePost.media}
          caption={activePost.caption}
          timestamp={activePost.timestamp}
          likes={activePost.likes}
          tags={activePost.tags}
          saved={activePost.saved}
          postUserDetails={activePost.postUserDetails}
          comments={activePost.comments}
          close={() => setActivePost(null)}
        />
      </div>
    </Modal>
    }
    </div>
  )
}

export default PostsGrid;
