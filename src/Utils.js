import {db} from './firebase-config';
import { doc, getDoc } from "firebase/firestore";

export function getUser(uid) {
    if(db.collection('user').doc(uid) != null) {
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
