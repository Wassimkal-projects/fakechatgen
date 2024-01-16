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
import {MessageActions, MessageStatus} from "../../enums/enums";
import {Message, MessageDisplayed, ReactState} from "../../utils/types/types";
import {SeenIcon} from "../Svg/SeenIcon/component";
import {DeliveredIcon} from "../Svg/DeliveredIcon/component";
import {SentIcon} from "../Svg/SentIcon/component";
import {SendingIcon} from "../Svg/SendingIcon/component";


export const MessageComponent: React.FC<{
  message: Message,
  index: number,
  updateMessage: (action: MessageActions, message?: string) => void,
  messageDisplayedState: ReactState<MessageDisplayed>,
  simulateMessageOn: boolean
}> = ({
        message,
        index,
        updateMessage,
        messageDisplayedState,
        simulateMessageOn
      }) => {

  const {text, received, imageMessage, status, displayTail} = message

  const [isReceived, setIsReceived] = useState(received)
  const [textMessage, setTextMessage] = useState(text)
  const [updateMessageArea, setUpdateMessageArea] = useState(false)
  const [messageDisplayed, setMessageDisplayed] = messageDisplayedState

  useEffect(() => {
        if (simulateMessageOn) {
          setMessageDisplayed({
            display: false,
            index: index
          })
        }
      },
      [index, setMessageDisplayed, simulateMessageOn])
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
    setTextMessage(text);
  }, [text])

  const toggleReceived = () => {
    setIsReceived(!isReceived);
    updateMessage(MessageActions.LEFT)
  }

  const setUpdatedMessage = (message: string) => {
    setTextMessage(message);
    updateMessage(MessageActions.UPDATE, message)
  }

  return (
      <div>
        <div onClick={() => toogleOptionsDisplayed()} className={"flex-message"}>
          {
              isReceived && displayTail && (<svg color={"white"} viewBox="0 0 8 13" height="13"
                                                 width="8"
                                                 preserveAspectRatio="xMidYMid meet"
                                                 className="receiver-tail" version="1.1" x="0px"
                                                 y="0px"
                                                 enableBackground="new 0 0 8 13">
                <title>tail-in</title>
                <path
                    opacity="0.13" fill="#0000000"
                    d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"/>
                <path
                    fill="currentColor"
                    d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"/>
              </svg>)
          }

          {/*start test*/}
          <div
              className={`${isReceived ? "whatsapp-text-received" : "whatsapp-text"} message-text hover-options`}>
            <p className="text-msg">{textMessage}</p>
            {imageMessage && (
                <>
                  {textMessage && <br/>}
                  <img className={"image-message"} src={imageMessage} alt="New message"
                       crossOrigin="anonymous"/>
                </>
            )}
            <span className="space-ex"/>
            <div className="msg-activity">
              <span className="msg-time"
                    data-time="08:42">{message.messageTime}</span>
              {!isReceived && <div className="message-status msg-status">
                {status === MessageStatus.DELIVERED && <DeliveredIcon/>}
                {status === MessageStatus.SEEN && <SeenIcon/>}
                {status === MessageStatus.SENT && <SentIcon/>}
                {status === MessageStatus.SENDING && <SendingIcon/>}
              </div>}
            </div>
          </div>

          {/*end test*/}
          {/*          <div className={isReceived ? "message-received hover-options" : "message hover-options"}
               key={`message-${index}`}>
            <p>{textMessage}</p>
            {imageMessage && (
                <>
                  {textMessage && <br/>}
                  <img className={"image-message"} src={imageMessage} alt="New message"
                       crossOrigin="anonymous"/>
                </>
            )}
            <div className={"message-status-time"}>
              <div className={"msg-time"}>10:25</div>
              {status === MessageStatus.DELIVERED && <DeliveredIcon></DeliveredIcon>}
              {status === MessageStatus.SEEN && <SeenIcon></SeenIcon>}
              {status === MessageStatus.SENT && <SentIcon></SentIcon>}
              {status === MessageStatus.SENDING && <SendingIcon></SendingIcon>}
            </div>
          </div>*/}
          {!isReceived && displayTail && (
              <svg className={"sender-tail"}
                   viewBox="0 0 7 12.19" height="21" width="12">
                <path opacity="0.12999999523162842; " fill="#0000000"
                      d="M5.19,0H0V11.19L6.47,2.57C7.53,1.16,7,0,5.19,0Z"/>
              </svg>
          )}
        </div>
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
                  <button disabled={isReceived} className="btn btn-sm btn-secondary"
                          onClick={() => toggleReceived()}>

                    <span><FontAwesomeIcon icon={faArrowLeft}/></span></button>
                </div>
                <div className={"col"}>
                  <button disabled={!isReceived} className="btn btn-sm btn-secondary"
                          onClick={() => toggleReceived()}>
                    <span><FontAwesomeIcon icon={faArrowRight} color={"white"}/></span>
                  </button>
                </div>
              </div>
            </div>)}
      </div>
  )
}