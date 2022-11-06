import { Button } from '@material-ui/core';
import React, { useState } from 'react'
import './CreatePost.css';
import { getStorage, ref, getDownloadURL, uploadBytesResumable  } from "firebase/storage";
import {db} from '../firebase-config';
import { serverTimestamp } from "firebase/firestore";

function CreatePost({username, user}) {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState(null);
    
    const handleFileChange = (event) => {
        if(event.target.files[0]){
            setFile(event.target.files[0]);
        }
    }

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
            },
            // function to be called once file is completely uploaded
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    // upload complete post in dB
                    db.collection('posts').add({
                        timestamp: serverTimestamp(),
                        caption: caption,
                        imgUrl: downloadURL,
                        username: username,
                        uid: user.uid
                    });

                    setCaption("");
                    setProgress(0);
                    setFile(null);
                });
            }
        );
    }
    return (
        <div className='imgUpload'>
            <progress className='imgUpload-progress' value={progress} max="100"></progress>
            <input type='text' placeholder='Enter your caption...' onChange={(event) => setCaption(event.target.value)} />
            <input type='file' onChange={handleFileChange} />
            <Button onClick={handlePost}>Upload</Button>
        </div>
    )
}

export default CreatePost;
