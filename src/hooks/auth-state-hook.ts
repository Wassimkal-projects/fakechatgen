import {useState, useEffect} from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import {firebaseConfig} from "../firebase/firebase-config";

const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error("Failed to logout: ", error);
    }
  };

  return {currentUser, loading, logout};
};

export default useAuthState;