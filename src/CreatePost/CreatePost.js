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
import Carousel from 'react-material-ui-carousel'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { getPost, updatePost } from '../Utils';

function CreatePost({user, postId, close}) {
    const [files, setFiles] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState(null);
    const [currFile, setCurrFile] = useState(null);
    const [showCarousel, setShowCarousel] = useState(false);
    const [fileUrls, setFileUrls] = useState([]);

    // edit post fields
    // all carousel items
    // text entered
    const [postData, setPostData] = useState(null);
    const [newCaption, setNewCaption] = useState(null);

    useEffect(() => {
        if(postId) {
            getPost(postId).then(post => {
                setPostData(post);
                if(post.media){
                    setShowCarousel(true);
                    setNewCaption(post.caption);
                }
            })
        }
    }, [postId])

    const refe = useRef();

    const handleFileChange = (event) => {
        if(event.target.files){
            const allFiles_ = Array.from(event.target.files);

            if(allFiles_.length > 0) {
                const allBlobUrls = [];
                allFiles_.map((file_) => {
                    const blobURL = URL.createObjectURL(file_);
                    allBlobUrls.push(blobURL);
                });
                if(currFile === null && files === null) {
                    setCurrFile(allBlobUrls);
                    setFiles(allFiles_);
                } else {
                    setCurrFile(currFile.concat(allBlobUrls));
                    setFiles(files.concat(allFiles_));
                }
                setShowCarousel(true);
            }
        }
    }

    useEffect(() => {
        if(files !== null && files.length > 0) {
            files.map((file_, index_) => {
                if(file_.type === 'video/mp4' && currFile && currFile[index_]) {
                    document.querySelector(`video.vid-` + index_).src = currFile[index_]; 
                }
            });
        }
        if(files && files.length === 0 || currFile && currFile.length === 0) {
            setShowCarousel(false);
            setFiles(null);
            setCurrFile(null);
        }
    }, [files, currFile]);

    const handlePost = async () => {
        // upload all files to fb storage
        await Promise.all(
            files.map((file_) => {
                return new Promise((res, rej) => {
                    const storage = getStorage();
                    const storageRef = ref(storage, `images/${file_.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file_);
                    
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
                            rej();
                            // db.collection('posts').add({
                            //     timestamp: serverTimestamp(),
                            //     caption: caption,
                            //     imgUrl: "CANT UPLOAD",
                            //     username: username,
                            //     uid: user.uid
                            // });
            
                            // setCaption("");
                            // setProgress(0);
                            // setFiles(null);
                        },
                        // function to be called once file is completely uploaded
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                // upload complete post in dB
                                // file_.type === 'video/mp4' ?
                                // db.collection('posts').add({
                                //     timestamp: serverTimestamp(),
                                //     caption: caption,
                                //     vidUrl: downloadURL,
                                //     username: username,
                                //     uid: user.uid
                                // }) : db.collection('posts').add({
                                //     timestamp: serverTimestamp(),
                                //     caption: caption,
                                //     imgUrl: downloadURL,
                                //     username: username,
                                //     uid: user.uid
                                // }) ;
                                setFileUrls(fileUrls.push({url :downloadURL, fileType: file_.type, taggedUsers: []}));
                                res(fileUrls);
                            });
                        }
                    );
                });
            })
        ).then(() => {
            db.collection('posts').add({
                timestamp: serverTimestamp(),
                caption: caption,
                media: fileUrls,
                username: user.username,
                uid: user.uid,
                likes: [],
                tags: [],
                saved: []
            });
            setCaption("");
            setProgress(0);
            setFiles(null);
            setCurrFile(null);
            setFileUrls([]);
        }).catch(err => console.err("Err ::", err));
    }

    const removeFile = (index) => {
        setShowCarousel(false);
        setFiles(files => files.filter((item_, index_) => index_ !== index));
        setCurrFile(files => files.filter((item_, index_) => index_ !== index));
        setShowCarousel(true);
    }

    const updateCurrentPost = () => {
        updatePost(postId, newCaption).then(() => close());
    }

    return (
        <div className='create-post'>
            <Grid container>
                <Grid item xs={7} className="bg-gray-200">
                    {progress > 0 && <progress className='imgUpload-progress' value={progress} max="100"></progress>}
                    {
                        progress >= 100 && <p>Done!</p>
                    }
                    {!postId && <div style={{'z-index': '4'}} className={'imgUpload' + currFile && currFile?.length > 0 ? 'add-file' : 'empty-file  h-100'} onClick={() =>  refe.current.click()}>
                        {
                            currFile === null && 
                            <div className='h-100 d-flex flex-column justify-content-center align-items-center cursor-pointer'>
                                <AddPhotoAlternateOutlinedIcon style={{transform: 'scale(5)'}}/>
                            </div>
                        }
                        {
                            currFile?.length > 0 && 
                            <div className='add-file-icon'>
                                <AddCircleOutlineOutlinedIcon />
                            </div>
                        }
                        <input ref={refe} multiple type="file" style={{display: 'none'}} onChange={handleFileChange}/>
                    </div>}
                    {
                        !postId && currFile && files && showCarousel &&
                        <div className='content h-100'>
                            {files.length > 0 && <Carousel sx={{width: '100%', height: '100%'}} className={'d-flex flex-column align-items-center justify-content-center overflow-visible carousel-container' + (files.length === 1 ? ' no-buttons' : '')} autoPlay={false} indicators={!(files.length === 1)}>
                                {files.map((file_, index_) => (
                                    <div className='h-100 w-100' key={index_}>
                                        {(file_.type === 'image/jpeg' || file_.type === 'image/webp'|| file_.type === 'image/png') && <img src={currFile[index_]} alt='post-img'/>}
                                        {file_.type === 'video/mp4' && <video alt='post-video' className={'vid-' + index_} controls/>}
                                        <div className='cancel-content' onClick={() => removeFile(index_)}>
                                            <CancelOutlinedIcon/>
                                        </div>
                                    </div>
                                ))}
                            </Carousel>}
                        </div>
                    }
                    {
                        postData && <div className='content h-100'>
                        <Carousel sx={{width: '25em', height: '20em'}} className={'d-flex flex-column align-items-center justify-content-center mt-4 overflow-visible carousel-container' + (postData.media.length === 1 ? ' no-buttons' : '')} autoPlay={false} indicators={!(postData.media.length === 1)}>
                            {postData.media.map((file_, index_) => (
                                <div className='h-100 w-100' key={index_}>
                                    {(file_.fileType === 'image/jpeg' || file_.fileType === 'image/webp' || file_.fileType === 'image/png') && <img src={file_.url} alt='post-img'/>}
                                    {file_.fileType === 'video/mp4' && <video alt='post-video' src={file_.url} controls/>}
                                </div>
                            ))}
                        </Carousel>
                    </div>
                    }
                </Grid>
                <Grid item xs={5}>
                    <div className='pt-3 pl-3 d-flex align-items-center'>
                        <Avatar alt={user.displayName} src={user.imgUrl}
                        sx={{ width: 25, height: 25 }}/>
                        <span className='m-1'>{user.username}</span>
                    </div>
                    <div className='mt-2 px-3 w-100'>
                        {!postId && <TextField
                            id="outlined-multiline-static"
                            multiline
                            rows={12}
                            onChange={(event) => setCaption(event.target.value)} 
                            placeholder='Enter your caption...'
                        />}
                        {
                            postData && <TextField
                                id="outlined-multiline-static"
                                multiline
                                rows={12}
                                onChange={(event) => setNewCaption(event.target.value)} 
                                value={newCaption}
                            />
                        }
                        <div className='flex justify-end py-3'>
                            {!postId && <button  disabled={!caption || !files} className={(!caption || !files ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 cursor-pointer') + ' text-sm md:mx-1 text-white font-semibold py-2 px-4 rounded'} onClick={handlePost}>Upload</button>}
                            {postData && <button disabled={!caption || !files} className={(!caption || !files ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer') + ' text-white text-sm md:mx-1 font-semibold py-2 px-4 rounded'} onClick={updateCurrentPost}>Update</button>}
                        </div>
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}

export default CreatePost;
