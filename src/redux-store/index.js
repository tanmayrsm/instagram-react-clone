import {createStore} from 'redux';

// reducer
const reducer = (state = {view : "POSTS"}, action) => {
    switch(action.type) {
        case 'POSTS' :
            return {
                view: 'POSTS'
            };
        case 'PROFILE' :
            return {
                view: 'PROFILE'
            };
        case 'SRUSER' :
            return {
                view: 'SRUSER'
            };
        case 'MESSAGING' :
            return {
                view: 'MESSAGING'
            };
        case 'CREATEPOST': 
            return {
                view: 'CREATEPOST'
            };
        default :
            return {
                view: 'POSTS'
            };
        
    }
};

const store = createStore(reducer);

export default store;

