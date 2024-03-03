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
import {MessageDiv} from "./styles";
import {UpdateMessage} from "../UpdateMessageComponent/component";


export const MessageComponent: React.FC<{
  message: Message,
  index: number,
  updateMessage: (action: MessageActions, message?: Message) => void,
  messageDisplayedState: ReactState<MessageDisplayed>,
  simulateMessageOn: boolean,
}> = ({
        message,
        index,
        updateMessage,
        messageDisplayedState,
        simulateMessageOn
      }) => {

  let currentMessage = message

  const [updateMessageArea, setUpdateMessageArea] = useState(false)
  const [messageDisplayed, setMessageDisplayed] = messageDisplayedState
  const updateMessageModalState = useState(false)

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

  const toggleReceived = () => {
    updateMessage(MessageActions.LEFT)
  };

  return (
      <>
        <UpdateMessage
            updateModalOpenState={updateMessageModalState}
            message={currentMessage}
            updateMessage={
              (message) => {
                currentMessage = message
                updateMessage(MessageActions.UPDATE, message)
              }
            }
        />
        <div
            className={(messageDisplayed.display && messageDisplayed.index === index) ? "options-border" : ""}>
          {currentMessage.messageDate && currentMessage.messageDate !== 'None' &&
              <div className={"row justify-content-center my-2"}>
                <div className={"col-auto message-date"}>
                  {currentMessage.messageDate}
                </div>
              </div>
          }
          <div className={"flex-message"}>
            {currentMessage.received && currentMessage.displayTail && (
                <svg color={"white"} viewBox="0 0 8 13" height="13"
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
            <MessageDiv $isreceived={currentMessage.received}
                        $isdisplaytail={currentMessage.displayTail}
                        className={`message-text hover-options`}
                        onClick={() => toogleOptionsDisplayed()}>
              <p className="text-msg">{currentMessage.text}</p>
              {currentMessage.imageMessage && (
                  <>
                    {currentMessage.text && <br/>}
                    <img className={"image-message"} src={currentMessage.imageMessage}
                         alt="New message"
                         crossOrigin="anonymous"/>
                  </>
              )}
              <span className="space-ex"/>
              <div className="msg-activity">
              <span className="msg-time"
                    data-time="08:42">{message.messageTime}</span>
                {!currentMessage.received && <div className="message-status msg-status">
                  {currentMessage.status === MessageStatus.DELIVERED && <DeliveredIcon/>}
                  {currentMessage.status === MessageStatus.SEEN && <SeenIcon/>}
                  {currentMessage.status === MessageStatus.SENT && <SentIcon/>}
                  {currentMessage.status === MessageStatus.SENDING && <SendingIcon/>}
                </div>}
              </div>
            </MessageDiv>
            {!currentMessage.received && currentMessage.displayTail && (
                <svg className={"sender-tail"}
                     viewBox="0 0 7 12.19" height="12" width="7">
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
                                onClick={() => updateMessageModalState[1](true)
                                  // onClick={() => setUpdateMessageArea(true)
                                }>
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
                    <button disabled={currentMessage.received} className="btn btn-sm btn-secondary"
                            onClick={() => toggleReceived()}>

                      <span><FontAwesomeIcon icon={faArrowLeft}/></span></button>
                  </div>
                  <div className={"col"}>
                    <button disabled={!currentMessage.received} className="btn btn-sm btn-secondary"
                            onClick={() => toggleReceived()}>
                      <span><FontAwesomeIcon icon={faArrowRight} color={"white"}/></span>
                    </button>
                  </div>
                </div>
              </div>)}
        </div>
      </>
  )
}