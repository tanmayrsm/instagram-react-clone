import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import {Provider} from 'react-redux';
import store from './redux-store/index';
import * as serviceWorker from './serviceWorker';
import { ContextProvider } from './Context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode> // disabled it, as react-insta-stories get stuck after first img/video
  // <ContextProvider>
    <Provider store={store}>
      <App />
    </Provider>
  // </ContextProvider>
  // </React.StrictMode>
);
serviceWorker.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
