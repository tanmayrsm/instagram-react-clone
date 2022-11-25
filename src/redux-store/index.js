import {createStore} from 'redux';

// reducer
const reducer = (state = {view : "POSTS", metaData: undefined}, action) => {
    switch(action.type) {
        case 'POSTS' :
            return {
                view: 'POSTS',
                metaData: action.metaData
            };
        case 'PROFILE' :
            return {
                view: 'PROFILE',
                metaData: action.metaData
            };
        case 'SRUSER' :
            return {
                view: 'SRUSER',
                metaData: action.metaData
            };
        case 'MESSAGING' :
            return {
                view: 'MESSAGING',
                metaData: action.metaData
            };
        case 'CREATEPOST': 
            return {
                view: 'CREATEPOST',
                metaData: action.metaData
            };
        case 'STORY': 
            return {
                view: 'STORY',
                metaData: action.metaData
            };
        default :
            return {
                view: 'POSTS',
                metaData: action.metaData
            };
        
    }
};

const store = createStore(reducer);

export default store;

