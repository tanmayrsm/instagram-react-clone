import React, {useRef, useState} from 'react'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './CreateStory.css';
import { getStorage, ref as Reff, getDownloadURL, uploadBytesResumable  } from "firebase/storage";
import {addStory} from "../Utils";

import EmojiKeyboard from '../EmojiKeyboard/EmojiKeyboard';
import SendIcon from '@mui/icons-material/Send';

function CreateStory({user, close}) {
    const [file, setFile] = useState(null);
    const [currBlobURL, setCurrBlobURL] = useState(null);
    const [msgText, setMessageInput] = useState(null);
    
    const metaData = useSelector((state) => state.metaData);
  
    const refe = useRef();

    useEffect(() => {
        console.log("File received ::", metaData.file);
        if(metaData?.file) {
            setFile(metaData.file);
            setCurrBlobURL(URL.createObjectURL(metaData?.file));
        }
    }, []);
    
    const addUserStory = (e) => {
        e.preventDefault();
        if(file && user) {
            const storage = getStorage();
            const storageRef = Reff(storage, `images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on("state_changed",
                // update progress
                (snapshot) => {
                    const progress =
                    Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                },
                // catch error
                (error) => {
                    console.log("Err while uplaoding story",error);
                },
                // function to be called once file is completely uploaded
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        const timeSt = Date.now();
                        const body = {
                            text: msgText,
                            timestamp: timeSt,
                            media: {
                                type: file.type,
                                url: downloadURL
                            },
                            whoWrote: user.uid
                        };
                        // add currentUsers msg in database
                        addStory(user.uid, body);
                        close();
                    });
                }
            );
            }
    }

    return (
        <div>
            {
                <div role="button" className='story-container'>
                {
                    file === null && 
                    <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
                        <AddPhotoAlternateOutlinedIcon width={'6em'} height={'4em'}/>
                        <span className='mt-1'>Add file</span>
                    </div>
                }
                {
                    file && 
                    <div className='h-100 w-100 content'>
                        {(file.type === 'image/jpeg' || file.type === 'image/webp') && <img src={currBlobURL} alt='post-img'/>}
                        {file.type === 'video/mp4' && <video alt='post-video' src={currBlobURL} controls/>}
                        <div className='cancel-content w-100'>
                            <CancelOutlinedIcon  onClick={() => close()}/>
                            <div className='w-100 d-flex btn'>
                                <EmojiKeyboard placeholder='Your thoughts...' setInputText={setMessageInput}/>
                                <div className='send-story-btn' role='button'><SendIcon  onClick={(e) => addUserStory(e)}/></div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            }
        </div>
    )
}

export default CreateStory;
