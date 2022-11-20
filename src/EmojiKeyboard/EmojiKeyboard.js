import { Popover } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import React from 'react';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import { useState } from 'react';
import { useEffect } from 'react';

function EmojiKeyboard({setInputText, inputText, reset, placeholder, customEmoji, msgKey}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [usrText, setUserText] = useState(inputText);
    const open = Boolean(anchorEl);

    useEffect(() => {
        setUserText(reset ? '' : inputText);
    }, [reset]);

    const handleEmoji = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleCloseEmoji = () => {
        setAnchorEl(null);
    };

    const printEmoji = (d,e) => {
        setInputText(usrText + d.emoji);
        setUserText(usrText + d.emoji);
        if(customEmoji) {
            customEmoji(d.emoji, msgKey);
            handleCloseEmoji();
        }
    }
    
  return (
    <div className='d-flex w-100'>
            <Popover
                id={'id'}
                open={open}
                anchorEl={anchorEl}
                onClose={handleCloseEmoji}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
            >
                <EmojiPicker onEmojiClick={(d,e) => printEmoji(d,e)}/>
            </Popover>
            <div className='emoji-btn p-1' onClick={(e) => handleEmoji(e)}>
                <EmojiEmotionsOutlinedIcon />
            </div>
            {!customEmoji && <input type='text' className='w-100' placeholder={placeholder} value={usrText} onChange={(event) => {setInputText(event.target.value); setUserText(event.target.value)}} />}
    </div>
  )
}

export default EmojiKeyboard;
