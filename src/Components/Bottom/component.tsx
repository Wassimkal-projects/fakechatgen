import React from "react";
import './styles.css'

export const BottomComponent: React.FC = () => {
  return <>
    <div className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <div className="footer-col">
              <h4>About Chat visio</h4>
              <p>We're passionate about creating the best mobile apps for personal development</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="footer-col middle">
              <h4>Important Links</h4>
              <ul className="list-unstyled li-space-lg">
                <li className="media">
                  <i className="fas fa-square"></i>
                  <div className="media-body">
                    <p>Our business partners
                      <a className="turquoise" href="#your-link"> startupguide.com</a>
                    </p>
                  </div>
                </li>
                <li className="media">
                  <i className="fas fa-square"></i>
                  <div className="media-body"><p>Read our
                    <a className="turquoise"
                       href="terms-conditions.html"> Terms
                      & Conditions</a>, <a className="turquoise" href="privacy-policy.html"> Privacy
                      Policy</a></p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-4">
            <div className="footer-col last">
              <h4>Social Media</h4>
              <span className="fa-stack">
                            <a href="#your-link">
                                <i className="fas fa-circle fa-stack-2x"></i>
                                <i className="fab fa-facebook-f fa-stack-1x"></i>
                            </a>
                        </span>
              <span className="fa-stack">
                            <a href="#your-link">
                                <i className="fas fa-circle fa-stack-2x"></i>
                                <i className="fab fa-twitter fa-stack-1x"></i>
                            </a>
                        </span>
              <span className="fa-stack">
                            <a href="#your-link">
                                <i className="fas fa-circle fa-stack-2x"></i>
                                <i className="fab fa-google-plus-g fa-stack-1x"></i>
                            </a>
                        </span>
              <span className="fa-stack">
                            <a href="#your-link">
                                <i className="fas fa-circle fa-stack-2x"></i>
                                <i className="fab fa-instagram fa-stack-1x"></i>
                            </a>
                        </span>
              <span className="fa-stack">
                            <a href="#your-link">
                                <i className="fas fa-circle fa-stack-2x"></i>
                                <i className="fab fa-linkedin-in fa-stack-1x"></i>
                            </a>
                        </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}