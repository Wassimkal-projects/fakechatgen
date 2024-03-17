import {MainComponent} from "./Components/Main/component";
import HeaderComponent from "./Components/Header/components";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useState} from "react";
import {AuthModal} from "./Components/AuthModal/component";

const App = () => {

  // const [authContext, setAuthContext] = useState<AuthContextType | undefined>(undefined)
  const authModalState = useState(false)

  console.log('main')
  return <>
    <AuthModal authModalState={authModalState}></AuthModal>
    {/*<AuthComponent setAuthContext={setAuthContext}></AuthComponent>*/}
    {/*<AuthContext.Provider value={authContext}>*/}
    <HeaderComponent></HeaderComponent>
    <div className={"px-0 px-sm-5"}>
      <MainComponent authModalState={authModalState}></MainComponent>
    </div>
    {/*</AuthContext.Provider>*/}
  </>
}
export default App;
