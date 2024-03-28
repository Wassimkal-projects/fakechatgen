import './styles.css'

export const GreetingComponent = () => {
  return <div className={"greeting-container"}>
    <div className={"greeting-title"}>
      <h2>Welcome !</h2>
      <p>Start creating you stories</p>
    </div>
    <div className={"steps-container"}>
      <div className={"logo-step"}>
        <img src={require("../../img/bubble.png")} alt="bubble" width={100} height={100}/>
        <span>Write</span>
      </div>
      <div className={"logo-step"}>
        <img src={require("../../img/download.png")} alt="bubble" width={100} height={100}/>
        <span>Export</span>
      </div>
      <div className={"logo-step"}>
        <img src={require("../../img/share.png")} alt="bubble" width={100} height={100}/>
        <span>Share</span>
      </div>
    </div>
  </div>
}