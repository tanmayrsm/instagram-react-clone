import React from 'react';
import './ViewStory.css';
import CloseIcon from '@mui/icons-material/Close';

function ViewStory(props) {
  return (
    <div className='view-story'>
      <div className='position-relative'>
        {props.children}
        <CloseIcon role="button" style={{color: 'white', top: 0, right: '-2em', marginLeft: '1em', position: 'absolute'}}  onClick={() => props.close()}/>
      </div>
    </div>
  )
}

export default ViewStory;
