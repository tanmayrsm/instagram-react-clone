import { Avatar } from '@mui/material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import {doIFollowUser} from '../Utils';
import './ViewStory.css';
import { onValue, ref } from "firebase/database";
import {realtime_db} from '../firebase-config';
import ReactInstaStories from "react-insta-stories";
import ViewStory from './ViewStory';

// function SeeMore() {
//     return <div>Okay</div>;
//   }
function AvatarStory({user, currentUserId, dontShowAvatar, showName}) {
    const [showStory, setShowStory] = useState(false);
    const [allUserStories, setAllUserStories] = useState(null);
    const [expandStory, setExpandStory] = useState(false);
    const [showNormalAvatar, setShowNormalAvatar] = useState(!dontShowAvatar);
    const [showUserName, setShowUsername] = useState(false);

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
        if(showName) {
            setShowUsername(true);
        }
    }, []);

    const checkForUserStory = () => {
            const query = ref(realtime_db, "story/" + user.uid );
            return onValue(query, (snapshot) => {
            const data = snapshot.val();
                if (snapshot.exists()) {
                    const allStories = Object.values(data).map(storyData => {
                        return {
                            url: storyData.media?.url,
                            type: storyData.media?.type.split("/")[0],
                            header: {
                              heading: user.displayName,
                              subheading: storyData.timestamp + '',
                              profileImage: user.imgUrl
                            },
                            // seeMore : storyData.text ? () => <SeeMore text={storyData.text}/> : ''
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

    return (
        <span>
            {showNormalAvatar && <div>
                <div className={showStory ? 'story-avatar' :''} onClick={() => showUserStory()}>
                    {user && 
                    <div className='d-flex flex-column align-items-center justify-content-center'>
                        <div className='bordered-div post-avatar'>
                            <div className='space-div-border'>
                                <Avatar alt={user.displayName} src={user?.imgUrl}/>
                            </div>
                        </div>
                        {showName && <p>{user.displayName}</p>}
                    </div>
                    }
                </div>
                {allUserStories?.length && expandStory && 
                <ViewStory close={() => setExpandStory(false)}>
                    <ReactInstaStories stories={allUserStories}
                        onAllStoriesEnd={() => setExpandStory(false)}
                        defaultInterval={1000}
                        width={432}
                        height={768} 
                    />
                </ViewStory>
                }
            </div>}
        </span>
    )
}

export default AvatarStory;
