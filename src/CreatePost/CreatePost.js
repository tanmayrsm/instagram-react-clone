import { Button } from '@material-ui/core';
import React, { useState, useRef } from 'react'
import './CreatePost.css';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import { getStorage, ref, getDownloadURL, uploadBytesResumable  } from "firebase/storage";
import {db} from '../firebase-config';
import { serverTimestamp } from "firebase/firestore";
import { Avatar, TextField } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { useEffect } from 'react';

function CreatePost({username, user}) {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState(null);
    const [currFile, setCurrFile] = useState(null);

    const refe = useRef();

    const handleFileChange = (event) => {
        if(event.target.files[0]){
            const blobURL = URL.createObjectURL(event.target.files[0]);
            setCurrFile(blobURL);
            setFile(event.target.files[0]);
        }
    }

    useEffect(() => {
        if(file !== null && file.type === 'video/mp4' && currFile) {
            document.querySelector("video").src = currFile;
        }
    }, [file, currFile]);

    const handlePost = () => {
        // upload file to fb storage
        const storage = getStorage();
        const storageRef = ref(storage, `images/${file.name}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on("state_changed",
            // update progress
            (snapshot) => {
                const progress =
                Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(progress);
            },
            // catch error
            (error) => {
                console.log("Err while uplaoding post",error);
                db.collection('posts').add({
                    timestamp: serverTimestamp(),
                    caption: caption,
                    imgUrl: "CANT UPLOAD",
                    username: username,
                    uid: user.uid
                });

                setCaption("");
                setProgress(0);
                setFile(null);
            },
            // function to be called once file is completely uploaded
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    // upload complete post in dB
                    file.type === 'video/mp4' ?
                    db.collection('posts').add({
                        timestamp: serverTimestamp(),
                        caption: caption,
                        vidUrl: downloadURL,
                        username: username,
                        uid: user.uid
                    }) : db.collection('posts').add({
                        timestamp: serverTimestamp(),
                        caption: caption,
                        imgUrl: downloadURL,
                        username: username,
                        uid: user.uid
                    }) ;

                    setCaption("");
                    setProgress(0);
                    setFile(null);
                });
            }
        );
    }
    return (
        <div className='create-post'>
            <Grid container spacing={2}>
                <Grid item xs={7}>
                    {progress > 0 && <progress className='imgUpload-progress' value={progress} max="100"></progress>}
                    {
                        progress >= 100 && <p>Done!</p>
                    }
                    {currFile === null && <div className='imgUpload h-100' onClick={() =>  refe.current.click()}>
                        <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
                            <AddPhotoAlternateOutlinedIcon width={'6em'} height={'4em'}/>
                            <span className='mt-1'>Add file</span>
                        </div>
                        <input ref={refe} type="file" style={{display: 'none'}} onChange={handleFileChange}/>
                    </div>}
                    {currFile && file && <div className='content h-100' onClick={() =>  refe.current.click()}>
                        {file.type === 'image/jpeg' && <img src={currFile} alt='post-image'/>}
                        {file.type === 'video/mp4' && <video alt='post-video' controls/>}
                        <div className='cancel-content'>
                            <CancelOutlinedIcon onClick={() => setCurrFile(null)}/>
                        </div>
                    </div>}
                </Grid>
                <Grid item xs={5}>
                    <div className='d-flex align-items-center mt-1'>
                        <Avatar alt={user.displayName} src={user.imgUrl}
                        sx={{ width: 25, height: 25 }}/>
                        <span className='m-1'>{user.username}</span>
                    </div>
                    <div className='mt-3 w-100'>
                        <TextField
                            id="outlined-multiline-static"
                            multiline
                            rows={8}
                            onChange={(event) => setCaption(event.target.value)} 
                            placeholder='Enter your caption...'
                        />
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Button onClick={handlePost}>Upload</Button>
                </Grid>
            </Grid>
        </div>
    )
}

export default CreatePost;
