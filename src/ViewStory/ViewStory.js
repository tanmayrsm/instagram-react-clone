import React from 'react';
import './ViewStory.css';
import CloseIcon from '@mui/icons-material/Close';

function ViewStory(props) {
  return (
    <div className='view-story'>
      {props.children}
      <CloseIcon role="button" style={{color: 'white', marginLeft: '1em'}}  onClick={() => props.close()}/>
    </div>
  )
}

export default ViewStory;
