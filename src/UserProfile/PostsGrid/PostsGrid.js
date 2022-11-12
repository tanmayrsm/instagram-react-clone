import React from 'react'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useEffect } from 'react';
import {db} from '../../firebase-config';
import { useState } from 'react';
import './PostsGrid.css';

function PostsGrid({user}) {
      const [allPosts, setAllPosts] = useState([]);
      useEffect(() => {
        db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            // set posts array from firebase db
            setAllPosts(
                snapshot.docs
                .map(doc => ({
                        postId: doc.id,
                        uid: doc.data().uid,
                        imgUrl:doc.data().imgUrl,
                        title: 'Post by ' + doc.data().username
                    })
                ).filter(post => post.uid === user.uid)
            );
          })
      }, []);

  return (
    <div>
      <ImageList cols={5}>
      {allPosts && allPosts.length && allPosts.map((item) => (
        <ImageListItem key={item.postId} className='post-img'>
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
    </div>
  )
}

export default PostsGrid;
