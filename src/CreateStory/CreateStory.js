import React, {useRef, useState} from 'react'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './CreateStory.css';
import { getStorage, ref as Reff, getDownloadURL, uploadBytesResumable  } from "firebase/storage";
import {addStory} from "../Utils";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import gifLogo from '../../src/assets/load.gif';


import EmojiKeyboard from '../EmojiKeyboard/EmojiKeyboard';
import SendIcon from '@mui/icons-material/Send';

function CreateStory({user, close}) {
    const [file, setFile] = useState(null);
    const [currBlobURL, setCurrBlobURL] = useState(null);
    const [msgText, setMessageInput] = useState(null);
    const [open, setOpen] = useState(true);
    const [giff, setGif] = useState(false);

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
                        setGif(false);
                    });
                }
            );
            }
    }

    const action = (
        <React.Fragment>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      );

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
                        {(file.type === 'image/jpeg' || file.type === 'image/webp' || file.type === 'image/png') && <img src={currBlobURL} alt='post-img'/>}
                        {file.type === 'video/mp4' && <video alt='post-video' src={currBlobURL} controls/>}
                        <div className='story-misc-container w-100'>
                            <div className='cancel-content'>
                                <CancelOutlinedIcon onClick={() => close()}/>
                            </div>
                            <div className='absolute bottom-1 w-96 left-1'>
                                <div className='w-100 flex'>
                                    <EmojiKeyboard placeholder='Your thoughts...' setInputText={setMessageInput}/>
                                    <div className='send-story-btn' role='button'>
                                    {giff ?  <button type='button'  className='font-semibold text-sm flex justify-center'><img className='giffAuth' src={gifLogo} alt="giflogo"/></button> :
                                        <SendIcon color="primary" onClick={(e) => {addUserStory(e); setGif(true)}}/>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            }
            <Snackbar
                open={open}
                autoHideDuration={6000}
                message="Story added!"
                action={action}
            />
        </div>
    )
}

export default CreateStory;
