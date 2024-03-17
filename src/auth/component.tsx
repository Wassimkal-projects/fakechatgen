//TODO check for updates to remove the compat
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {firebaseConfig} from '../firebase/firebase-config';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import StyledFirebaseAuth from "./StyledFirebaseAuth/component";
import {useMemo, useState} from "react";
import {AuthContextType} from "../context/auth-context";
// import User = firebase.User;

export const AuthComponent: React.FC<{
  setAuthContext: (autContext: AuthContextType) => void
}> = ({setAuthContext}) => {
  // Initialize Firebase

  const [authUser, setAuthUser] = useState<any | null>(null)

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const logout = () => {
    firebase.auth().signOut().then(user => {
      console.log(user + ' signed out')
    })
  }

  const handleAuthContextChange = useMemo(() => (user: any | null) => {
    setAuthContext({
      user: user,
      logout: logout
    })
  }, [setAuthContext])

  firebase.auth().onAuthStateChanged((user: any | null) => {
    if (user !== authUser) {
      if (user) {
        setAuthUser(user)
        handleAuthContextChange(user)
      } else {
        setAuthUser(null)
        handleAuthContextChange(user)
      }
    }
  });

  // Configure FirebaseUI.
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/',
    // We will display Google and Email as auth providers.
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        clientId: "932977234389-v476l5ke1cjhbaquce9607nunrbp434l.apps.googleusercontent.com"
      },
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
  };

  return (
      <>
        {!authUser && <div>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </div>}
      </>

  );
}

export default AuthComponent;
