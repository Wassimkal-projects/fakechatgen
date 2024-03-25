import {MainComponent} from "./Components/Main/component";
import HeaderComponent from "./Components/Header/components";
import {useState} from "react";
import {AuthModal} from "./Components/AuthModal/component";
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BottomComponent} from "./Components/Bottom/component";

const App = () => {

  // const [authContext, setAuthContext] = useState<AuthContextType | undefined>(undefined)
  const authModalState = useState(false)

  console.log('main')
  return <>
    <AuthModal authModalState={authModalState}></AuthModal>
    <HeaderComponent></HeaderComponent>
    <div className={"app-container"}>
      <div className={"main-container"}>
        <MainComponent authModalState={authModalState}></MainComponent>
      </div>
    </div>
    <BottomComponent></BottomComponent>
  </>
}
export default App;
