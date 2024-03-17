import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import {useAuth} from "../../hooks/auth-hook";

const HeaderComponent = () => {
  const authContext = useAuth();

  return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          {/* Logo on the Left */}
          <a className="navbar-brand" href="/">
            <img src={require("../../img/logo_chatvisio_square.png")} height="60px" width="60px"
                 alt={"Logo"}></img>
            Chat visio
          </a>

          {/* Toggler/Collapsible Button for Smaller Screens */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                  data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                  aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Options on the Right */}
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                {authContext?.user &&
                    <a className="nav-link" href="/" onClick={authContext.logout}>Logout</a>
                }
              </li>
            </ul>
          </div>
        </div>
      </nav>
  );
}

export default HeaderComponent;