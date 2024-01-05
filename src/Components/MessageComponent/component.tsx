import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faCheck,
  faPenToSquare,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import './styles.css';
import {MessageActions} from "../../enums/enums";
import {MessageDisplayed, ReactState} from "../../utils/types/types";


export const MessageComponent: React.FC<{
  message: string | undefined,
  received: boolean,
  imageMessage?: string,
  index: number,
  updateMessage: (action: MessageActions, message?: string) => void,
  messageDisplayedState: ReactState<MessageDisplayed>
}> = ({message, received, index, updateMessage, messageDisplayedState, imageMessage}) => {

  const [isReceived, setIsReceived] = useState(received)
  const [textMessage, setTextMessage] = useState(message)

  const [updateMessageArea, setUpdateMessageArea] = useState(false)
  const [messageDisplayed, setMessageDisplayed] = messageDisplayedState

  const toogleOptionsDisplayed = () => {
    setMessageDisplayed({
      display: (!(index === messageDisplayed.index && messageDisplayed.display)),
      index: index
    })
    setUpdateMessageArea(false)
  }

  useEffect(() => {
    setIsReceived(received)
  }, [received])

  useEffect(() => {
    setTextMessage(message);
  }, [message])

  const toggleReceived = () => {
    setIsReceived(!isReceived);
    updateMessage(MessageActions.LEFT)
  }

  const setUpdatedMessage = (message: string) => {
    setTextMessage(message);
    updateMessage(MessageActions.UPDATE, message)
  }

  return (
      <>
        {!isReceived ? (
            <div onClick={() => toogleOptionsDisplayed()} className={"flex-message"}>
          <span className={"message-tail"}>
              <svg viewBox="0 0 8 13" height="13"
                   width="8"
                   preserveAspectRatio="xMidYMid meet"
                   className="" version="1.1" x="0px"
                   y="0px"
                   enableBackground="new 0 0 8 13">
                <title>tail-in</title>
                <path
                    opacity="0.13" fill="#0000000"
                    d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"/>
                <path
                    fill="currentColor"
                    d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"/>
              </svg>
            </span>
              <div className={"message hover-options"} key={`message-${index}`}>
                {textMessage}
                {imageMessage && (
                    <>
                      {textMessage && <br/>}
                      <img className={"image-message"} src={imageMessage} alt={""}/>
                    </>
                )}
              </div>
            </div>

        ) : (
            <div onClick={() => toogleOptionsDisplayed()} className={"flex-message"}>
              <div className={"message-received hover-options"} key={`message-${index}`}>
                {textMessage}
                {imageMessage && (
                    <>
                      {textMessage && <br/>}
                      <img className={"image-message"} src={imageMessage} alt={""}/>
                    </>
                )}
              </div>
            </div>
        )}
        {/* Options */}
        {messageDisplayed.display && messageDisplayed.index === index && (
            <div className={"message-options"}>
              <div className={"row mb-2"}>
                <div className={"col"}>
                  {updateMessageArea ? (
                      <button className="btn btn-sm btn-success"
                              onClick={() => setUpdateMessageArea(false)}>
                        <span><FontAwesomeIcon icon={faCheck}/></span></button>
                  ) : (
                      <button className="btn btn-sm btn-success"
                              onClick={() => setUpdateMessageArea(true)}>
                        <span><FontAwesomeIcon icon={faPenToSquare}/></span></button>
                  )}
                </div>
                <div className={"col"}>
                  <button className="btn btn-sm btn-danger"
                          onClick={() => updateMessage(MessageActions.DELETE)}>
                    <span><FontAwesomeIcon icon={faTrash}/></span>
                  </button>
                </div>

              </div>
              {updateMessageArea && (<div>
                <textarea className={"update-text"} value={textMessage}
                          onChange={event => setUpdatedMessage(event.target.value)}/>
              </div>)}
              <div className={"row"}>
                <div className={"col"}>
                  <button className="btn btn-sm btn-secondary"
                          onClick={() => updateMessage(MessageActions.UP)}>
                    <span><FontAwesomeIcon icon={faArrowUp}/></span>
                  </button>
                </div>
                <div className={"col"}>
                  <button className="btn btn-sm btn-secondary"
                          onClick={() => updateMessage(MessageActions.DOWN)}>
                    <span><FontAwesomeIcon icon={faArrowDown}/></span>
                  </button>
                </div>
                <div className={"col"}>
                  <button disabled={!isReceived} className="btn btn-sm btn-secondary"
                          onClick={() => toggleReceived()}>

                    <span><FontAwesomeIcon icon={faArrowLeft}/></span></button>
                </div>
                <div className={"col"}>
                  <button disabled={isReceived} className="btn btn-sm btn-secondary"
                          onClick={() => toggleReceived()}>
                    <span><FontAwesomeIcon icon={faArrowRight} color={"white"}/></span>
                  </button>
                </div>
              </div>
            </div>)}
      </>
  )
}