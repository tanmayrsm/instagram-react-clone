import { Avatar, Modal } from '@mui/material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import {doIFollowUser} from '../Utils';
import './ViewStory.css';
import { onValue, ref } from "firebase/database";
import {realtime_db} from '../firebase-config';
import ReactInstaStories from "react-insta-stories";
import ViewStory from './ViewStory';
import {addUserToSeenListOfStory} from '../Utils';
import UserLists from '../UserLists/UserLists';
import {getModalStyle, useStyles} from '../stylesUtil.js';
import zIndex from '@mui/material/styles/zIndex';


// function SeeMore() {
//     return <div>Okay</div>;
//   }
function AvatarStory({user, currentUserId, dontShowAvatar, showName, size}) {
    const [showStory, setShowStory] = useState(false);
    const [allUserStories, setAllUserStories] = useState(null);
    const [expandStory, setExpandStory] = useState(false);
    const [showNormalAvatar, setShowNormalAvatar] = useState(!dontShowAvatar);
    const [storyKeys, setStorykeys] = useState([]);
    const [currStoryIndex, setCurrStoryIndex] = useState(0);
    const [userIdLists, setUsersIdList] = useState(null);
    const [showSeenList, setShowSeenList] = useState(false);
    const [allStoriesSeen, setAllStoriesSeen] = useState(true);
    const classes = useStyles();
  
    useEffect(() => {
        if(user.uid !== currentUserId) {
            doIFollowUser(currentUserId, user.uid).then((val) => {
                if(val) {
                    checkForUserStory();
                } else {
                    // setShowNormalAvatar
                }
            });
        } else if(user.uid === currentUserId) {
            checkForUserStory();
        }
        
    }, []);

    const checkForUserStory = () => {
            const query = ref(realtime_db, "story/" + user.uid );
            return onValue(query, (snapshot) => {
            const data = snapshot.val();
                if (snapshot.exists()) {
                    // set story keys, which later is used to set 'seen' status of story
                    setStorykeys(Object.keys(data));
                    const allStories = Object.values(data).map(storyData => {
                        if(!storyData.seen || (storyData.seen && !storyData.seen[currentUserId])) {
                            // variable to set red bordered around story
                            setAllStoriesSeen(false);
                        }
                        return {
                            url: storyData.media?.url,
                            type: storyData.media?.type.split("/")[0],
                            header: {
                              heading: user.uid === currentUserId ? 'Your story' : user.displayName,
                              subheading: storyData.timestamp + '',
                              profileImage: user.imgUrl
                            },
                            seen : storyData.seen
                          }
                    });
                    setShowStory(true);
                    setAllUserStories(allStories);
                    if(dontShowAvatar) {
                        setShowNormalAvatar(true);
                    }
                } else {
                    setShowStory(false);
                    if(dontShowAvatar) {
                        setShowNormalAvatar(false);
                    }
                }
            }, (noData) => {
                setShowStory(false);
            });
    }

    const showUserStory = () => {
        if(showStory) {
            setExpandStory(true);
        }
    }

    const setStorySeen = (index) => {
        if(allUserStories[index] && ((!allUserStories[index].seen) || (allUserStories[index].seen && !allUserStories[index].seen[currentUserId]))) {
            // this user havent seen this story yet, add him in seen list
            addUserToSeenListOfStory(currentUserId, user.uid, storyKeys[index]);
        }
        if(index === allUserStories.length - 1) {
            setAllStoriesSeen(true);
        }
    }

    const showSeenListToUser = (index) => {
        setCurrStoryIndex(index);
        if(currentUserId === user.uid && allUserStories[index].seen) {
            const seenList = Object.keys(allUserStories[index].seen).filter(id => id !== currentUserId);
            setUsersIdList({userIdList: seenList});
        }
    }

    return (
        <span>
            {showNormalAvatar && <div className='d-flex story-container-avatar justify-content-center align-items-center'>
                <div className={showStory ? 'story-avatar' :''} onClick={() => showUserStory()}>
                    {user && 
                    <div className='d-flex flex-column align-items-center justify-content-center'>
                        <div className={allStoriesSeen ? 'unbordered-div post-avatar' : 'bordered-div post-avatar'}>
                            <div className='space-div-border'>
                                <Avatar sx={{width: size, height: size}} alt={user.displayName} src={user?.imgUrl}/>
                            </div>
                        </div>
                        {showName && <p>{user.displayName}</p>}
                    </div>
                    }
                </div>
                {allUserStories?.length && expandStory && 
                <div>
                    <ViewStory close={() => setExpandStory(false)}>
                        <ReactInstaStories stories={allUserStories}
                            onAllStoriesEnd={() => {setExpandStory(false); setAllStoriesSeen(true)}}
                            width={432}
                            height={768} 
                            onStoryStart={(index) => {
                                showSeenListToUser(index); 
                                setStorySeen(index);
                            }}
                            isPaused={showSeenList}
                        />
                    </ViewStory>
                        {/* section of all seen story users (visible only to user who posted same story) */}
                        {currentUserId === user.uid && allUserStories[currStoryIndex] && allUserStories[currStoryIndex].seen && Object.keys(allUserStories[currStoryIndex].seen).length > 1 &&
                            <div className='seen-story-div'>
                                <p onClick={() => setShowSeenList(true)}>Viewed by {Object.keys(allUserStories[currStoryIndex].seen).length - 1}</p>
                                {
                                    showSeenList && 
                                    <Modal
                                    open={showSeenList}
                                    onClose={() => setShowSeenList(false)}
                                    style={{zIndex: 23000}}
                                    >
                                        <div style={getModalStyle()} className={classes.paper}>
                                            <UserLists userIdList={userIdLists}/>
                                        </div>
                                    </Modal> 
                                }
                            </div>
                        }
                </div>
                }
            </div>}
        </span>
    )
}

export default AvatarStory;
