import {Modal} from "react-bootstrap";
import {ReactState} from "../../utils/types/types";
import AuthComponent from "../../auth/component";

export const AuthModal: React.FC<{
  authModalState: ReactState<boolean>,
}> = ({authModalState}) => {

  const closeModal = () => {
    authModalState[1](false)
  }

  return <Modal
      show={authModalState[0]}
      onHide={closeModal}
      aria-labelledby="Authentication Modal"
      aria-describedby="Authenticatin Modal"
  >
    <AuthComponent></AuthComponent>
  </Modal>
}