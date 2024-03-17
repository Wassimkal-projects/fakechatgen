import {MainComponent} from "./Components/Main/component";
import HeaderComponent from "./Components/Header/components";
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthComponent from "./auth/component";
import {useState} from "react";
import AuthContext, {AuthContextType} from "./context/auth-context"

const App = () => {

  const [authContext, setAuthContext] = useState<AuthContextType | undefined>(undefined)

  return <>
    <AuthComponent setAuthContext={setAuthContext}></AuthComponent>
    <AuthContext.Provider value={authContext}>
      <HeaderComponent></HeaderComponent>
      <div className={"px-0 px-sm-5"}>
        <MainComponent></MainComponent>
      </div>
    </AuthContext.Provider>
  </>
}
export default App;
