import { Avatar, Button, Drawer } from '@mui/material';
import React, { useEffect, useRef, useState }  from 'react'
import Drawerr from '../Drawerr/Drawerr';

import { FormControl } from '@mui/material';
import './EditProfile.css';

import { getStorage, ref, getDownloadURL, uploadBytesResumable  } from "firebase/storage";
import {db} from '../firebase-config';
import { serverTimestamp } from "firebase/firestore";

import TextField from '@mui/material/TextField';

function Editprofile({user}) {
    const refe = useRef();
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [userImg, setusrImg] = useState(user.imgUrl);
    const [userName, setUsername] = useState(user.username);
    const [userDisplayName, setDisplayName] = useState(user.displayName);
    const [userBio, setBio] = useState(user.bio);
    
    const handleClick = (e) => {
        refe.current.click();
    }

    useEffect(() => {
        if(file !== null) {
            handlePost();
        }
    }, [file]);

    const handleFileChange = async (event) => {
        if(event.target.files[0]){
            setFile(event.target.files[0]);
        }
    }

    const handlePost = () => {
        // upload file to fb storage
        const storage = getStorage();
        const storageRef = ref(storage, `userImages/${file.name}`);
        
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
                    db.collection('user').doc(user.uid).set({
                        bio: userBio,
                        displayName: userDisplayName,
                        imgUrl: downloadURL,
                        username: userName
                    });
                    setusrImg(downloadURL);
                    setProgress(0);
                    setFile(null);
                });
            }
        );
    }

    const saveDetails = () => {
        db.collection('user').doc(user.uid).set({
            bio: userBio,
            displayName: userDisplayName,
            imgUrl: userImg,
            username: userName
        });
    }

    return (
        <div className='edit-profile-container d-flex p-2 bg-white'>
        {/* <div className='col-3'> 
            <ul>
                <li>
                    Edit profile
                </li>
                <li>
                    Change Password
                </li>
                
            </ul>
        </div> */}
        {/* <div className='divider'></div> */}
        <div className='col-12 edit-profile-form'>
            <span className='d-flex my-2'>
                <Avatar className='edit-profile-avatar' alt={user.displayName} src={userImg}/>
                <div className='px-3'>
                    <strong>{user.displayName}</strong>
                    <br/>
                    <Button className='change-pp-text' onClick={() => handleClick()}>Change Profile Photo</Button>
                    <input ref={refe} type="file" style={{display: 'none'}} onChange={handleFileChange}/>
                </div>
            </span>
            <FormControl className='xs:w-full sm:w-80 md:w-80 xl:w-80 lg:w-80'>
                <TextField defaultValue={userDisplayName} required
                    id="outlined-required"
                    className='input-textfield'
                    label="Name"
                    onChange={(event) => setDisplayName(event.target.value)}></TextField>
                    <br/>
                <TextField defaultValue={userName} required
                    id="outlined-required"
                    className='input-textfield'
                    label="Username"
                    onChange={(event) => setUsername(event.target.value)}></TextField>
                    <br/>
                <TextField defaultValue={userBio} multiline
            rows={4} required
                    id="outlined-required"
                    className='input-textfield'
                    label="Bio"
                    onChange={(event) => setBio(event.target.value)}></TextField>
                <br/>
                <button className='font-semibold text-blue-400 px-2' onClick={() => saveDetails()}>Save</button>
            </FormControl>
        </div>
        </div>
    )
}

export default Editprofile;
