import {db} from './firebase-config';
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getDatabase, onDisconnect, onValue, ref, set, update, child, push, remove, serverTimestamp } from "firebase/database";
import {realtime_db} from './firebase-config';
import TimeAgo from 'javascript-time-ago'
// English.
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)

// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

export function getTimeAgo(ts) {
    return timeAgo.format(ts, 'twitter');
}

export function getUser(uid) {
    if(db.collection('user').doc(uid) !== null) {
        const fetchDocById = async () => {
          const docRef = doc(db, "user", uid) // db = getFirestore()
    
          // Fetch document
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
              return docSnap.data();
          }
          return null;
        }
        return fetchDocById();
    }
    return null;
}


export function getNoOfFollowers(uid) {
    const noOfFollowers = 0;
    if(db.collection('followers').doc(uid) !== null) {
        const fetchDocById = async () => {
            const docRef = doc(db, 'followers', uid);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()) {
                return Object.values(docSnap.data()).filter(val => !!val).length;
            }
            return 0;
        }
        return fetchDocById();
    }
    return noOfFollowers;
}

export function getNoOfFollowing(uid) {
    const noOfFollowing = 0;
    if(db.collection('following').doc(uid) !== null) {
        const fetchDocById = async () => {
            const docRef = doc(db, 'following', uid);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()) {
                return Object.values(docSnap.data()).filter(val => !!val).length;
            }
            return 0;
        }
        return fetchDocById();
    }
    return noOfFollowing;
}

export function followUser(currentUserid, otherUserId) {
    const updateDocByID = async () => {
        const docRef = doc(db, 'followers', otherUserId);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            await updateDoc(docRef, {[currentUserid]: true});
        } else {
            await setDoc(docRef, {[currentUserid]: true});
        }
    };
    return updateDocByID().then(async () => {
        const docRef = doc(db, 'following', currentUserid);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            await updateDoc(docRef, {[otherUserId]: true});
        } else {
            await setDoc(docRef, {[otherUserId]: true});
        }
    });
}

export function unFollowUser(currentUserid, otherUserId) {
    const updateDocByID = async () => {
        const docRef = doc(db, 'followers', otherUserId);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            await updateDoc(docRef, {[currentUserid]: null});
        } else {
            await setDoc(docRef, {[currentUserid]: null});
        }
    };
    return updateDocByID().then(async () => {
        const docRef = doc(db, 'following', currentUserid);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            await updateDoc(docRef, {[otherUserId]: null});
        } else {
            await setDoc(docRef, {[otherUserId]: null});
        }
    });
}

export function doIFollowUser(currentUserid, otherUserId) {
    const getDocById = async () => {
        const docRef = doc(db, 'followers', otherUserId);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            return !!docSnap.data()[currentUserid];
        } else {
            return false;
        }
    }
    return getDocById();
}

export function getAllUsersWithId(idList) {
    return idList.map(async id => {
        const docRef = doc(db, 'user', id);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
            return docSnap.data();
        }
        return false;
    }).filter(val => !!val);
}

export function getAllFollowers(uid) {
    const getDocById = async () => {
        const docRef = doc(db, 'followers', uid);
        const docSnap = await getDoc(docRef);
        let followersId = [];
        if(docSnap.exists()) {
            followersId = Object.entries(docSnap.data()).filter(([id, val]) => !!val).map(([id, val]) => id);
        }
        return followersId;
    }
    return getDocById();
}

export function getAllFollowing(uid) {
    const getDocById = async () => {
        const docRef = doc(db, 'following', uid);
        const docSnap = await getDoc(docRef);
        let followingId = [];
        if(docSnap.exists()) {
            followingId = Object.entries(docSnap.data()).filter(([id, val]) => !!val).map(([id, val]) => id);
        }
        return followingId;
    }
    return getDocById();
}

export function messageUser(from, to, messageBody) {
    const query = ref(realtime_db, "messages/" + from)
    let refe = child(query, to);
    const newMsgRef = push(refe);
    const msgId = newMsgRef.key;
    refe = child(query, to + "/" + msgId);
    update(refe, {...messageBody}); 
    
    // push same message in 'to' user's message list
    const query2 = ref(realtime_db, "messages/" + to)
    const refe2 = child(query2, from + "/" + msgId);
    update(refe2, {...messageBody}); 
}

export function deleteMessageFromDB(from, to, msgKey) {
    const query = ref(realtime_db, "messages/" + from + "/" + to)
    const refe = child(query, msgKey);
    remove(refe);
    
    const query2 = ref(realtime_db, "messages/" + to + "/" + from)
    const refe2 = child(query2, msgKey);
    remove(refe2);
}

export function updateReaction(from, to, key, value) {
    const query = ref(realtime_db, "messages/" + from + "/" + to)
    const refe = child(query, key + '/reaction');
    update(refe, value);

    const query2 = ref(realtime_db, "messages/" + to + "/" + from)
    const refe2 = child(query2, key + '/reaction');
    update(refe2, value);
}

export function addStory(from, messageBody) {
    const query = ref(realtime_db, "story/" + from)
    push(query, {...messageBody}); 
}

export function addUserToSeenListOfStory(addUsrId, userIdWhoPostedStory, storyId) {
    const query = ref(realtime_db, "story/" + userIdWhoPostedStory + "/" + storyId)
    const refe = child(query, '/seen');
    update(refe, {[addUsrId] : true});
}

export function setUserStatus(currentUserid, onlineStatus) {
    if(onlineStatus) {
        const query = ref(realtime_db, "users/" + currentUserid);
        update(query, {register : onlineStatus});
    } else {
        const lastOnlineRef = ref(realtime_db, 'online/' + currentUserid);
        set(lastOnlineRef, serverTimestamp())
    }
}

// this method consists of logic to set user offline in db, when app is closed
export function establishUserConnection (userId) {
    // Since I can connect from multiple devices or browser tabs, we store each connection instance separately
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    const db = getDatabase();
    const myConnectionsRef = ref(db, 'online/' + userId);
    
    // stores the timestamp of my last disconnect (the last time I was seen online)
    const lastOnlineRef = ref(db, 'online/' + userId);
    
    // update(myConnectionsRef, {online: true});
    // const connectedRef = ref(db, '.info/connected');
    onValue(ref(db, 'users/' + userId), (snap) => {
      if (!!snap.val()) {
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        const con = push(myConnectionsRef);
    
        // When I disconnect, remove this device
        onDisconnect(con).remove();
    
        // Add this device to my connections list
        // this value could contain info about the device or a timestamp too
        set(con, true);
    
        // When I disconnect, update the last time I was seen online
        onDisconnect(lastOnlineRef).set(serverTimestamp());
      }
    });
}

export function getPost(postId) {
    if(db.collection('posts').doc(postId) !== null) {
        const fetchDocById = async () => {
          const docRef = doc(db, "posts", postId) // db = getFirestore()
    
          // Fetch document
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
              return docSnap.data();
          }
          return null;
        }
        return fetchDocById();
    }
    return null;
}

export function updatePost(postId, caption) {
    const updateDocByID = async () => {
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        const st = new Date();
        if(docSnap.exists()) {
            await updateDoc(docRef, {caption: caption, timestamp: st});
        }
    };
    return updateDocByID();
}

export function deletePost(postId) {
    const deleteDocByID = async () => {
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            await deleteDoc(docRef);
        }
    };
    return deleteDocByID();
}