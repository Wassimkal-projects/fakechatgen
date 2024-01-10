import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// @ts-ignore
import html2canvas from "html2canvas";
import {PhotoProfilModale} from "./Components/PhotoProfilModale/component";
import {MessageComponent} from "./Components/MessageComponent/component";
import {MessageActions} from "./enums/enums";
import {Message, MessageDisplayed} from "./utils/types/types";
import {ImageUpload} from "./Components/ImageUpload/components";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBatteryHalf,
  faEllipsisV,
  faPhone,
  faSignal,
  faVideoCamera
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const senderTypingSound = new Audio(require('./sounds/typing_sound_whatsapp.mp3'));
  senderTypingSound.loop = true;

  const messageSent = new Audio(require('./sounds/sent_sound_whatsapp.mp3'));
  const messageReceived = new Audio(require('./sounds/message_received.mp3'));

  const receiverTypingSound = new Audio(require('./sounds/is_writing_whatsapp.mp3'));
  receiverTypingSound.loop = true;

  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);

  const input = document.getElementById('messageInput');


  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesSim, setMessagesSim] = useState<Message[]>([]);

  const [inputMessage, setInputMessage] = useState<string>('')
  const [receiverStatus, setReceiverStatus] = useState<string>('Online')
  const setProfilePictureSrcState = useState<string>(require("./img/avatar.png"))

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const typingSpeed = 90; // Speed in milliseconds
  const delayBetweenMessages = 1000;
  const responseTime = 2000;
  const endOfMessagesRef = useRef(null);
  const [receiverName, setReceiverName] = useState('Your name');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [simulateMessageOn, setSimulateMessageOn] = useState(false)

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, {type: 'video/webm'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sendMessage = useCallback((message: Message) => {
    let messageContainer = document.getElementById('chatMessages');

    let newMessage = {received: message.received} as Message;

    if (message.message) {
      newMessage.message = message.message;
    }
    if (message.imageMessage) {
      newMessage.imageMessage = message.imageMessage;
    }
    if (message.message || message.imageMessage) {
      setMessages([...messages, newMessage])
      // @ts-ignore
      setInputMessage('')
      messageContainer!.scrollTop = messageContainer!.scrollHeight;
    }
  }, [messages])

  useEffect(() => {
    // functions
    const simulateReceivingMessage = (message: Message) => {
      setReceiverStatus('Typing')
      receiverTypingSound.play()
      setTimeout(() => {
        receiverTypingSound.pause();
        sendMessage({
          message: message.message,
          received: true,
          imageMessage: message.imageMessage
        })
        messageReceived.play();
        setReceiverStatus('Online')
        setCurrentMessageIndex(currentMessageIndex + 1);
        if (currentMessageIndex === messagesSim.length - 1) {
          setTimeout(() => {
            setSimulateMessageOn(false)
            stopRecording();
          }, 2000)
        }
      }, responseTime)
    }

    const simulateTypingMessage = (message: Message) => {
      senderTypingSound.play();
      let index = 0;
      const typeChar = () => {
        if (index < message.message!.length) {
          input!.textContent = input!.textContent + message.message!.charAt(index);
          index++;
          setTimeout(typeChar, typingSpeed);
        } else {
          // End sound after a message is complete
          senderTypingSound.pause();

          // Wait, then move to the next message
          setTimeout(() => {
            sendMessage({
              message: input!.textContent!,
              received: false,
              imageMessage: message.imageMessage
            })
            input!.textContent = '';
            messageSent.play();
            setCurrentMessageIndex(currentMessageIndex + 1);
            if (currentMessageIndex === messagesSim.length - 1) {
              setTimeout(() => {
                setSimulateMessageOn(false)
                stopRecording();
              }, 2000)
            }
          }, delayBetweenMessages);
        }
      };
      typeChar();
    }

    const simulateSendingImage = (message: Message) => {
      senderTypingSound.pause();
      sendMessage(message)
      messageSent.play();
      setCurrentMessageIndex(currentMessageIndex + 1);
      if (currentMessageIndex === messagesSim.length - 1) {
        setTimeout(() => {
          setSimulateMessageOn(false)
          stopRecording();
        }, 2000)
      }
    }

    const simulateRecevingImage = (message: Message) => {
      senderTypingSound.pause();
      sendMessage(message)
      messageSent.play();
      setCurrentMessageIndex(currentMessageIndex + 1);
      if (currentMessageIndex === messagesSim.length - 1) {
        setTimeout(() => {
          setSimulateMessageOn(false)
          stopRecording();
        }, 2000)
      }
    }

    if (isTyping && currentMessageIndex < messagesSim.length) {
      setTimeout(() => {
        const message = messagesSim[currentMessageIndex];
        if (!message.received) {
          if (message.message) {
            simulateTypingMessage(message)
          } else if (message.imageMessage) {
            simulateSendingImage(message)
          }
        } else {
          if (message.message) {
            simulateReceivingMessage(message)
          } else if (message.imageMessage) {
            simulateRecevingImage(message)
          }
        }
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, currentMessageIndex, messagesSim]);

  useEffect(() => {
    // @ts-ignore
    endOfMessagesRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]); // Dependency array includes messages, so effect runs when messages update

  useEffect(() => {
    if (currentMessageIndex >= messagesSim.length) {
      setIsTyping(false); // Stop typing when all messages are done
    }
  }, [currentMessageIndex, messagesSim]);

  const simulateAllChat = () => {
    if (messages.length < 1) return;

    // TODO hide all options
    setSimulateMessageOn(true)

    setMessagesSim(
        messages.map(message => message)
    )
    setMessages([])
    if (!isTyping) {
      setIsTyping(true);
      setCurrentMessageIndex(0);
      input!.textContent = '';
    }
  };


  const chatRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasStreamRef = useRef(null);
  const [imageMessage, setImageMessage] = useState<string | undefined>(undefined)

  const startRecording = () => {
    setRecordedChunks([])
    simulateAllChat();

    const canvas = document.createElement('canvas');
    // @ts-ignore
    canvas.width = (chatRef.current!.offsetWidth);
    // @ts-ignore
    canvas.height = (chatRef.current!.offsetHeight);

    // @ts-ignore
    canvasStreamRef.current = canvas.captureStream(15); // 30 FPS

    // @ts-ignore
    mediaRecorderRef.current = new MediaRecorder(canvasStreamRef.current, {
      mimeType: 'video/webm'
    });

    // @ts-ignore
    mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    // @ts-ignore
    mediaRecorderRef.current.start();
    requestAnimationFrame(() => captureFrame(scaleCanvasImage(canvas)));
  };

  const scaleCanvasImage = (canvas: HTMLCanvasElement) => {
    const scaleBy = 6;
    const w = canvas.width;
    const h = canvas.height;
    canvas.width = canvas.width * scaleBy;
    canvas.height = canvas.height * scaleBy;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    return canvas;
  }
  const captureFrame = (canvas: HTMLCanvasElement) => {
    // @ts-ignore
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return;
    }
    if (chatRef.current) {
      html2canvas(chatRef.current, {scale: 2, useCORS: true}).then(capturedCanvas => {
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(() => captureFrame(canvas));
      });
    }
  };

  const stopRecording = () => {
    // @ts-ignore
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // @ts-ignore
      mediaRecorderRef.current.stop();
    }
    if (canvasStreamRef.current) {
      // @ts-ignore
      canvasStreamRef.current.getTracks().forEach(track => track.stop());
    }


  };

  const pdpState = useState(false)
  const [messageOptionsDisplayed, setMessageOptionsDisplayed] = useState<MessageDisplayed>({
    display: false,
    index: 0
  })

  const updateMessage = (action: MessageActions, index: number, message?: string) => {
    const swapElements = (index1: number, index2: number): any[] => {
      const newArray = [...messages];
      let temp = newArray[index1];
      newArray[index1] = newArray[index2];
      newArray[index2] = temp;
      return newArray;
    };

    const updatedMessages = [...messages]
    switch (action) {
      case MessageActions.UPDATE:
        updatedMessages[index] = {
          message: message!,
          received: updatedMessages[index].received
        }
        setMessages(updatedMessages)
        break;
      case MessageActions.DELETE:
        setMessages(updatedMessages.filter(message => message !== updatedMessages[index]));
        break;
      case MessageActions.DOWN:
        if (updatedMessages.length <= 1 || index === updatedMessages.length - 1) return;
        setMessageOptionsDisplayed({
          index: index + 1,
          display: true
        })
        setMessages(swapElements(index, index + 1))
        break;
      case MessageActions.UP:
        if (updatedMessages.length <= 1 || index === 0) return;
        setMessageOptionsDisplayed({
          index: index - 1,
          display: true
        })
        setMessages(swapElements(index, index - 1))
        break;
      case MessageActions.LEFT:
      case MessageActions.RIGHT:
        updatedMessages[index].received = !updatedMessages[index].received
        setMessages(updatedMessages)
        break;
    }
  }

  return (
      <>
        <div className={"container-fluid main-page"}>
          <div className="row">
            <PhotoProfilModale pdpState={pdpState}
                               setProfilePictureSrcState={setProfilePictureSrcState}/>
            <div className="col-lg-6 mb-5">
              <div>
                <div className="input-group input-group-sm">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-sm">Name</span>
                  </div>
                  <input type="text" className="form-control" aria-label="Small"
                         value={receiverName}
                         aria-describedby="inputGroup-sizing-sm" onChange={(event) =>
                      setReceiverName(event.target.value)
                  }/>
                </div>
                <div className="input-group input-group-sm">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-sm">Status</span>
                  </div>
                  <input type="text" className="form-control" aria-label="Small"
                         value={receiverStatus}
                         aria-describedby="inputGroup-sizing-sm" onChange={(event) =>
                      setReceiverStatus(event.target.value)
                  }/>
                </div>
                {/*<AvatarImageCropper className={"avatar-style"} apply={apply}/>*/}
                <div className={"messages-input"}>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">Add to conversation</span>

                    </div>
                    <textarea value={inputMessage} className="form-control"
                              aria-label="With textarea"
                              onChange={(event) =>
                                  setInputMessage(event.target.value)
                              }/>
                  </div>
                  <div>
                    <ImageUpload setImageMessageState={[imageMessage, setImageMessage]}/>
                    {imageMessage &&
                        <img src={imageMessage} alt="Preview" style={{maxWidth: '250px'}}/>}
                  </div>
                  <div className={"row px-3"}>
                    <button className="col btn btn-primary"
                            onClick={() => {
                              sendMessage({
                                message: inputMessage,
                                received: false,
                                imageMessage: imageMessage
                              })
                              setImageMessage(undefined)
                            }}>send
                    </button>
                    <button className="col btn btn-outline-primary"
                            onClick={() => {
                              sendMessage({
                                message: inputMessage,
                                received: true,
                                imageMessage: imageMessage
                              })
                              setImageMessage(undefined)
                            }}>receive
                    </button>
                    <button className="col btn btn-danger" onClick={() => setMessages([])}>Clear
                    </button>
                    <button disabled={simulateMessageOn} className="col btn btn-warning"
                            onClick={() => simulateAllChat()}>Simulate
                    </button>
                  </div>
                  <div className={"row px-3"}>
                    <button className="col btn btn-outline-primary"
                            onClick={startRecording}>Record
                    </button>
                    <button className="col btn btn-outline-primary"
                            onClick={() => stopRecording()}>En recording
                    </button>
                    <button className="col btn btn-danger" disabled={simulateMessageOn}
                            onClick={() => downloadRecording()}>Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div ref={chatRef} className="chat-container">
                <div className="phone-top-bar">
                  <span className="time">09:41 am</span>
                  <span className="network-status">
              <span>H+</span>
                    <FontAwesomeIcon icon={faSignal}/>
                    <span>50%</span>
                    <FontAwesomeIcon icon={faBatteryHalf}/>
            </span>

                </div>
                <div className="whatsapp-header">
                  <div className="pic-and-name">
                  <span className={"whatsapp-actions center-icon"}>
                  <FontAwesomeIcon icon={faArrowLeft}/>
                  </span>
                    <img className="profile-pic" src={setProfilePictureSrcState[0]}
                         alt="alt-profile" crossOrigin="anonymous"
                         onClick={() => pdpState[1](true)}/>
                    <div className="name-and-status">
                      <span className={"name-text"}>{receiverName}</span>
                      <span className={"status-text"}>{receiverStatus}</span>
                    </div>
                  </div>
                  <span className="whatsapp-actions">
                  <button><FontAwesomeIcon
                      icon={faVideoCamera}/></button>
                  <button><FontAwesomeIcon icon={faPhone}/></button>
                  <button><FontAwesomeIcon icon={faEllipsisV}/></button>
                </span>
                </div>
                <div className="chat-messages" id="chatMessages">
                  {messages.map((message, index) => {
                    return (
                        <MessageComponent
                            key={index}
                            index={index}
                            message={message.message}
                            received={message.received}
                            imageMessage={message.imageMessage}
                            updateMessage={(action, message) => updateMessage(action, index, message)}
                            messageDisplayedState={[messageOptionsDisplayed, setMessageOptionsDisplayed]}
                            simulateMessageOn={simulateMessageOn}/>
                    )
                  })}
                  <div ref={endOfMessagesRef}/>
                </div>
                {<div className="message-bar">
                  <div className="message-input">
                    <div className={"emoji-container"}>
                      <span className={"icon-emoji center-icon"}/>
                    </div>
                    <div id="messageInput"
                         className={"editable-div"}
                         contentEditable="true"
                         role="textbox"
                         aria-multiline="false"
                    />
                    <div className={"right-input"}>
                      <div className={"emoji-container"}>
                        <span className={"icon-clip center-icon"}/>
                      </div>
                      <div className={"emoji-container"}>
                        <span className={"icon-camera center-icon"}/>
                      </div>
                    </div>
                  </div>
                  <span className={"whatsapp-actions"}>
                  <div className={"emoji-container"}>
                  <span className={"icon-microphone center-icon"}/>
                  </div>
                  </span>


                </div>}
              </div>
            </div>
          </div>
        </div>
      </>
  )
}

export default App;
