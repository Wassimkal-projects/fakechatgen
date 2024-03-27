import {MainComponent} from "./Components/Main/component";
import HeaderComponent from "./Components/Header/components";
import {useState} from "react";
import {AuthModal} from "./Components/AuthModal/component";
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BottomComponent} from "./Components/Bottom/component";
import {StoreContext} from "./store";
import {appStore} from "./store/appStore";
import {FAQComponent} from "./Components/FAQ/component";

const App = () => {

  const authModalState = useState(false)

  return <StoreContext.Provider value={{appStore}}>
    <AuthModal authModalState={authModalState}/>
    <HeaderComponent/>

    <div className={"app-container"}>
      <div className={"main-container"}>
        Turn Your Ideas into Engaging Videos!
      </div>
      <div className={"main-container"}>
        <MainComponent authModalState={authModalState}></MainComponent>
      </div>
      <div className={"main-container"}>
        <h1>FAQ</h1>
        <FAQComponent></FAQComponent>
      </div>
    </div>
    <BottomComponent/>
  </StoreContext.Provider>
}
export default App;
