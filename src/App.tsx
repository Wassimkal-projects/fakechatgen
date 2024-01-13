import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Nav, Tab} from 'react-bootstrap';

// @ts-ignore
import html2canvas from "html2canvas";
import {PhotoProfilModale} from "./Components/PhotoProfilModale/component";
import {MessageComponent} from "./Components/MessageComponent/component";
import {MessageActions} from "./enums/enums";
import {Message, MessageDisplayed} from "./utils/types/types";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBatteryHalf,
  faEllipsisV,
  faImage,
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
  const [receiverName, setReceiverName] = useState('John Doe');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [simulateMessageOn, setSimulateMessageOn] = useState(false)
  const [inputKey, setInputKey] = useState(Date.now());
  const chatRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasStreamRef = useRef(null);
  const [imageMessage, setImageMessage] = useState<string | undefined>(undefined)
  const [selectedMessageStatus, setSelectedMessageStatus] = useState('flexRadioSeen'); // Default to the second radio

  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputKey(Date.now())
  }, [imageMessage])


  const handleMessageStatusChange = (event: any) => {
    setSelectedMessageStatus(event.target.id);
  };

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
    const scaleBy = 2;
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

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file && file.type.substr(0, 5) === 'image') {
      setImageMessage(URL.createObjectURL(file))
    }
  };

  const handleUploadImage = () => {
    imageInputRef.current!.click();
  }

  return (
      <>
        <div className={"container-fluid main-page"}>
          <div className="row">
            <PhotoProfilModale pdpState={pdpState}
                               setProfilePictureSrcState={setProfilePictureSrcState}/>
            <div className="col mb-5">
              <div className={"left-container"}>
                <div className={"form-floating"}>
                  {/*                  <div className="input-group-prepend">
                    <span className="input-group-text"
                          id="inputGroup-sizing-sm">Receiver's name</span>
                  </div>*/}
                  <input type="text"
                         className="form-control"
                         placeholder="Receiver's name"
                         id="receiversNameFormControl"
                         value={receiverName}
                         onChange={(event) =>
                             setReceiverName(event.target.value)
                         }/>
                  <label htmlFor="receiversNameFormControl">
                    Receiver's name
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="flexShowHeaderSwitch"
                         checked/>
                  <label className="form-check-label" htmlFor="flexShowHeaderSwitch">Checked
                    Show header</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="flexShowPercentageSwitch"
                         checked/>
                  <label className="form-check-label" htmlFor="flexShowPercentageSwitch">Checked
                    Show percentage</label>
                </div>
                <select className="form-select" aria-label="Default select example">
                  <option selected>Network</option>
                  <option value="1">5G</option>
                  <option value="2">4G</option>
                  <option value="3">LTE</option>
                </select>
                <div className={"form-floating"}>
                  <input type="text"
                         className="form-control"
                         placeholder="Time"
                         id="timeFormControl"
                  />
                  <label htmlFor="timeFormControl">
                    Time
                  </label>
                </div>
                <Tab.Container id="left-tabs-example" defaultActiveKey="person1">
                  <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="person1">Person 1</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="person2">Person 2</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="person1">
                      <div className="form-floating">
                        {imageMessage &&
                            <div className={"image-preview"}>
                              <img src={imageMessage} alt="Preview" style={{maxWidth: '250px'}}/>
                            </div>}
                        <textarea value={inputMessage}
                                  id="floatingTextarea"
                                  className="form-control"
                                  onChange={(event) =>
                                      setInputMessage(event.target.value)
                                  }/>
                        <label htmlFor="floatingTextarea">Message</label>

                        <label className="image-upload">
                          <input className={"image-upload"} ref={imageInputRef} type="file"
                                 accept="image/*" key={inputKey}
                                 onChange={handleImageChange}/>
                        </label>
                        <button className="inside-button" onClick={() => handleUploadImage()}>
                          <FontAwesomeIcon icon={faImage} color={"#1cb9c8"}
                          />
                        </button>

                      </div>
                      <div>
                        <div className="row">
                          <div className="col">
                            <div className="form-check">
                              <input className="form-check-input" type="radio"
                                     name="flexRadioSending"
                                     id="flexRadioSending"
                                     checked={selectedMessageStatus === "flexRadioSending"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="flexRadioSending">
                                <span aria-label="Sending" data-icon="msg-time" className=""><svg
                                    viewBox="0 0 16 15" width="16"
                                    preserveAspectRatio="xMidYMid meet" className="" version="1.1"
                                    x="0px" y="0px"
                                    enable-background="new 0 0 16 15"><title>msg-time</title>
                                  <path
                                      fill="currentColor"
                                      d="M9.75,7.713H8.244V5.359c0-0.276-0.224-0.5-0.5-0.5H7.65c-0.276,0-0.5,0.224-0.5,0.5v2.947 c0,0.276,0.224,0.5,0.5,0.5h0.094c0.001,0,0.002-0.001,0.003-0.001S7.749,8.807,7.75,8.807h2c0.276,0,0.5-0.224,0.5-0.5V8.213 C10.25,7.937,10.026,7.713,9.75,7.713z M9.75,2.45h-3.5c-1.82,0-3.3,1.48-3.3,3.3v3.5c0,1.82,1.48,3.3,3.3,3.3h3.5 c1.82,0,3.3-1.48,3.3-3.3v-3.5C13.05,3.93,11.57,2.45,9.75,2.45z M11.75,9.25c0,1.105-0.895,2-2,2h-3.5c-1.104,0-2-0.895-2-2v-3.5 c0-1.104,0.896-2,2-2h3.5c1.105,0,2,0.896,2,2V9.25z"/></svg></span>
                                Sending
                              </label>
                            </div>
                          </div>
                          <div className="col">
                            <div className="form-check">
                              <input className="form-check-input" type="radio"
                                     name="flexRadioSent"
                                     id="flexRadioSent"
                                     checked={selectedMessageStatus === "flexRadioSent"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="flexRadioSent">
                                <span aria-label="icon-sent" data-icon="msg-check"
                                      className=""><svg
                                    viewBox="0 0 12 11" height="11" width="16"
                                    preserveAspectRatio="xMidYMid meet" className=""
                                    fill="none"><title>msg-check</title>
                                  <path
                                      d="M11.1549 0.652832C11.0745 0.585124 10.9729 0.55127 10.8502 0.55127C10.7021 0.55127 10.5751 0.610514 10.4693 0.729004L4.28038 8.36523L1.87461 6.09277C1.8323 6.04622 1.78151 6.01025 1.72227 5.98486C1.66303 5.95947 1.60166 5.94678 1.53819 5.94678C1.407 5.94678 1.29275 5.99544 1.19541 6.09277L0.884379 6.40381C0.79128 6.49268 0.744731 6.60482 0.744731 6.74023C0.744731 6.87565 0.79128 6.98991 0.884379 7.08301L3.88047 10.0791C4.02859 10.2145 4.19574 10.2822 4.38194 10.2822C4.48773 10.2822 4.58929 10.259 4.68663 10.2124C4.78396 10.1659 4.86436 10.1003 4.92784 10.0156L11.5738 1.59863C11.6458 1.5013 11.6817 1.40186 11.6817 1.30029C11.6817 1.14372 11.6183 1.01888 11.4913 0.925781L11.1549 0.652832Z"
                                      fill="currentcolor"/>
                                </svg>
                                </span>
                                Sent
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <div className="form-check">
                              <input className="form-check-input" type="radio"
                                     name="flexRadioDelivered"
                                     id="flexRadioDelivered"
                                     checked={selectedMessageStatus === "flexRadioDelivered"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="flexRadioDelivered">
                                <span aria-label=" Distribué " data-icon="msg-dblcheck"
                                      className="icon-delivered">
                                  <svg viewBox="0 0 16 11" height="11" width="16"
                                       preserveAspectRatio="xMidYMid meet"
                                       className=""
                                       fill="none"><title>msg-dblcheck</title><path
                                      d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z"
                                      fill="currentColor"/>
                                </svg>
                                </span>
                                Delivered
                              </label>
                            </div>
                          </div>
                          <div className="col">
                            <div className="form-check">
                              <input className="form-check-input" type="radio"
                                     name="flexRadioSeen"
                                     id="flexRadioSeen"
                                     checked={selectedMessageStatus === "flexRadioSeen"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="flexRadioSeen">
                                <span aria-label=" Lu " data-icon="msg-dblcheck"
                                      className="icon-seen">
                                  <svg viewBox="0 0 16 11" height="11"
                                       width="16"
                                       preserveAspectRatio="xMidYMid meet"
                                       className=""
                                       fill="none">
                                    <title>msg-dblcheck</title>
                                    <path
                                        d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z"
                                        fill="currentColor">
                                    </path>
                                  </svg>
                                </span>
                                Seen
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={"messages-input"}>
                        <br/>
                        <div className={"row px-3"}>
                          <button className="col btn btn-primary"
                                  onClick={() => {
                                    sendMessage({
                                      message: inputMessage,
                                      received: false,
                                      imageMessage: imageMessage
                                    })
                                    setImageMessage(undefined)
                                  }}>Add to conversation
                          </button>
                        </div>
                        <br/>
                        <div className={"row px-3"}>
                          <button className="col btn btn-danger"
                                  onClick={() => setMessages([])}>Clear
                          </button>
                          <button disabled={simulateMessageOn} className="col btn btn-warning"
                                  onClick={() => simulateAllChat()}>Simulate
                          </button>
                          <button disabled={messages.length === 0 || simulateMessageOn}
                                  className="col btn btn-outline-primary"
                                  onClick={startRecording}>Get video
                          </button>
                          <button className="col btn btn-outline-primary"
                                  onClick={() => stopRecording()}>End recording
                          </button>
                        </div>
                      </div>

                    </Tab.Pane>
                    <Tab.Pane eventKey="person2">
                      <div className="form-floating">
                        <textarea value={inputMessage}
                                  id="floatingTextarea"
                                  className="form-control"
                                  onChange={(event) =>
                                      setInputMessage(event.target.value)
                                  }/>
                        <label htmlFor="floatingTextarea">Message</label>
                      </div>
                      <div className={"messages-input"}>
                        <br/>
                        <div className={"row px-3"}>
                          <button className="col btn btn-primary"
                                  onClick={() => {
                                    sendMessage({
                                      message: inputMessage,
                                      received: true,
                                      imageMessage: imageMessage
                                    })
                                    setImageMessage(undefined)
                                  }}>Add to conversation
                          </button>
                        </div>
                        <br/>
                        <div className={"row px-3"}>
                          <button className="col btn btn-danger"
                                  onClick={() => setMessages([])}>Clear
                          </button>
                          <button disabled={simulateMessageOn} className="col btn btn-warning"
                                  onClick={() => simulateAllChat()}>Simulate
                          </button>
                          <button disabled={messages.length === 0 || simulateMessageOn}
                                  className="col btn btn-outline-primary"
                                  onClick={startRecording}>Get video
                          </button>
                          <button className="col btn btn-outline-primary"
                                  onClick={() => stopRecording()}>End recording
                          </button>
                        </div>
                      </div>

                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </div>
            </div>
            <div className="col">
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
              <div className={"generate-buttons"}>
                <button className="btn btn-secondary"
                        disabled={simulateMessageOn || recordedChunks.length === 0}>Download as
                  Image
                </button>

                <button className="btn btn-success"
                        disabled={simulateMessageOn}
                        onClick={() => downloadRecording()}>Download as video
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
  )
}

export default App;
