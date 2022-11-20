import {db} from './firebase-config';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useState } from 'react';
import { async } from '@firebase/util';
import { onValue, ref, set, update, child, push, remove } from "firebase/database";
import {realtime_db} from './firebase-config';

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
        let followersId = [];
        if(docSnap.exists()) {
            followersId = Object.entries(docSnap.data()).filter(([id, val]) => !!val).map(([id, val]) => id);
        }
        return followersId;
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