import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Nav, Tab} from 'react-bootstrap';

// @ts-ignore
import html2canvas from "html2canvas";
import {PhotoProfilModale} from "./Components/PhotoProfilModale/component";
import {MessageComponent} from "./Components/MessageComponent/component";
import {MessageActions, MessageStatus} from "./enums/enums";
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
import {DeliveredIcon} from "./Components/Svg/DeliveredIcon/component";
import {SentIcon} from "./Components/Svg/SentIcon/component";
import {SendingIcon} from "./Components/Svg/SendingIcon/component";
import {SeenIcon} from "./Components/Svg/SeenIcon/component";
import {toDateInHumanFormat, toDateInUsFormat} from "./utils/date/dates";

function App() {
  const silentSound = new Audio(require('./sounds/silent_audio.mp3'));
  silentSound.loop = true;

  const senderTypingSound = useRef(new Audio(require('./sounds/typing_sound_whatsapp.mp3')));
  senderTypingSound.current.loop = true;

  let messageSentSound = useRef(new Audio(require('./sounds/sent_sound_whatsapp.mp3')));

  let messageReceivedSound = useRef(new Audio(require('./sounds/message_received.mp3')));

  let receiverTypingSound = useRef(new Audio(require('./sounds/is_writing_whatsapp.mp3')));
  receiverTypingSound.current.loop = true;

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
  const [selectedMessageStatus, setSelectedMessageStatus] = useState('SEEN'); // Default to the second radio
  const [showPercentageChecked, setShowPercentageChecked] = useState(true)
  const [showHeaderChecked, setShowHeaderChecked] = useState(true)
  const [network, setNetwork] = useState<string>('5G')
  const [date, setDate] = useState<string>('None')
  const [otherDate, setOtherDate] = useState<string>(toDateInUsFormat(new Date()))
  const [waitingDownload, setWaitingDownload] = useState<boolean>(false)

  const [time, setTime] = useState<string>('15:11')
  const [messageTime, setMessageTime] = useState<string>('15:11')
  const [activeTab, setActiveTab] = useState('person1'); // default to the first tab

  const handleTabSelect = (key: any) => {
    setActiveTab(key);
  };

  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputKey(Date.now())
  }, [imageMessage])


  const handleMessageStatusChange = (event: any) => {
    setSelectedMessageStatus(event.target.id);
  };

  const clearConversation = () => {
    setMessages([])
    setRecordedChunks([])
  }
  const sendMessage = useCallback((message: Message) => {
    let newMessage = {
      received: message.received,
      status: message.status,
      displayTail: message.displayTail,
      messageTime: message.messageTime,
      messageDate: message.messageDate
    } as Message;

    if (message.text) {
      newMessage.text = message.text;
    }
    if (message.imageMessage) {
      newMessage.imageMessage = message.imageMessage;
    }
    if (message.text || message.imageMessage) {
      setMessages([...messages, newMessage])
      // @ts-ignore
      setInputMessage('')
    }
  }, [messages])

  useEffect(() => {
    try {
      // functions
      const simulateReceivingMessage = (message: Message) => {
        setReceiverStatus('Typing')
        receiverTypingSound.current.muted = false
        setTimeout(() => {
          receiverTypingSound.current.muted = true
          sendMessage({
            text: message.text,
            received: true,
            imageMessage: message.imageMessage,
            status: message.status,
            displayTail: currentMessageIndex === 0 ? true : !messages[currentMessageIndex - 1].received,
            messageTime: message.messageTime,
            messageDate: message.messageDate
          })
          messageReceivedSound.current.play();
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
        senderTypingSound.current.muted = false;
        let index = 0;

        const scrollToBottom = () => {
          //TODO make it conditional to the length
          input!.scrollTop = input!.scrollHeight;
        }

        const typeChar = () => {
          if (index < message.text!.length) {
            input!.textContent = input!.textContent + message.text!.charAt(index);
            scrollToBottom();
            index++;
            setTimeout(typeChar, typingSpeed);
          } else {
            // End sound after a message is complete
            senderTypingSound.current.muted = true
            silentSound.play()
            // Wait, then move to the next message
            setTimeout(() => {
              sendMessage({
                displayTail: currentMessageIndex === 0 ? true : messages[currentMessageIndex - 1].received,
                text: input!.textContent!,
                received: false,
                imageMessage: message.imageMessage,
                status: message.status,
                messageTime: message.messageTime,
                messageDate: message.messageDate
              })
              input!.textContent = '';
              messageSentSound.current.play();
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
        senderTypingSound.current.pause();
        sendMessage(message)
        messageSentSound.current.play();
        setCurrentMessageIndex(currentMessageIndex + 1);
        if (currentMessageIndex === messagesSim.length - 1) {
          setTimeout(() => {
            setSimulateMessageOn(false)
            stopRecording();
          }, 2000)
        }
      }

      const simulateRecevingImage = (message: Message) => {
        senderTypingSound.current.pause();
        sendMessage(message)
        messageSentSound.current.play();
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
            if (message.text) {
              simulateTypingMessage(message)
            } else if (message.imageMessage) {
              simulateSendingImage(message)
            }
          } else {
            if (message.text) {
              simulateReceivingMessage(message)
            } else if (message.imageMessage) {
              simulateRecevingImage(message)
            }
          }
        }, 1000)
      }
    } catch (error) {
      console.log("Error from useEffect", error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, currentMessageIndex, messagesSim]);

  useEffect(() => {
    if (simulateMessageOn) {
      if (messages[messages.length - 1]?.imageMessage) {
        setTimeout(() => {
          // @ts-ignore
          endOfMessagesRef.current?.scrollIntoView();
        }, 200)
      } else {
        // @ts-ignore
        endOfMessagesRef.current?.scrollIntoView();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

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

  const downloadRecording = useCallback(() => {
    const blob = new Blob(recordedChunks, {type: 'video/mp4'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.mp4';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [recordedChunks])

  useEffect(() => {
    if (waitingDownload && recordedChunks.length !== 0) {
      downloadRecording()
      setWaitingDownload(false)
    }
  }, [downloadRecording, recordedChunks, waitingDownload])

  let startRecording = () => {
    setWaitingDownload(true)

    try {
      //start animation
      setRecordedChunks([]);
      simulateAllChat();
      const canvas = document.createElement('canvas');

      // Set canvas dimensions
      // @ts-ignore
      canvas.width = chatRef.current!.offsetWidth;
      // @ts-ignore
      canvas.height = chatRef.current!.offsetHeight;

      const audioContext = new AudioContext();
      const mixedOutput = audioContext.createMediaStreamDestination();

      // capture audio
      // @ts-ignore
      const source1 = audioContext.createMediaElementSource(receiverTypingSound.current);
      // @ts-ignore
      const source2 = audioContext.createMediaElementSource(senderTypingSound.current);
      // @ts-ignore
      const source3 = audioContext.createMediaElementSource(messageSentSound.current);
      // @ts-ignore
      const source4 = audioContext.createMediaElementSource(messageReceivedSound.current);
      
      // Assuming track1 and track2 are your audio tracks
      /*
            const source1 = audioContext.createMediaStreamSource(new MediaStream([...receiverTypingSoundStream.getAudioTracks()]));
            const source2 = audioContext.createMediaStreamSource(new MediaStream([...senderTypingSoundStream.getAudioTracks()]));
            const source3 = audioContext.createMediaStreamSource(new MediaStream([...messageSentSoundStream.getAudioTracks()]));
            const source4 = audioContext.createMediaStreamSource(new MediaStream([...messageReceivedSoundStream.getAudioTracks()]));
      */

      source1.connect(mixedOutput);
      source2.connect(mixedOutput);
      source3.connect(mixedOutput);
      source4.connect(mixedOutput);

      // Capture the stream from the canvas with the desired frame rate
      // @ts-ignore
      canvasStreamRef.current = canvas.captureStream(60); // Specify the frame rate here, e.g., 30 FPS

      // Combine audio and canvas streams
      const combinedStream = new MediaStream([
        // @ts-ignore
        ...canvasStreamRef.current.getVideoTracks(),
        ...mixedOutput.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm"

      // Initialize the MediaRecorder with the stream and specify the bit rate
      // @ts-ignore
      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: mimeType
      });

      // Handle the data available event
      // @ts-ignore
      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      senderTypingSound.current.play()
      senderTypingSound.current.muted = true;

      receiverTypingSound.current.play()
      receiverTypingSound.current.muted = true;

      // Start recording

      // @ts-ignore
      mediaRecorderRef.current.start();

      // Capture the frame (assuming this is a function defined elsewhere in your code)
      captureFrame(scaleCanvasImage(canvas));

    } catch (error) {
      console.log("Error log from startRecording", error);
    }
  }

  const scaleCanvasImage = (canvas: HTMLCanvasElement) => {
    const scaleBy = 1.5;
    const w = canvas.width;
    const h = canvas.height;
    canvas.width = w * scaleBy;
    canvas.height = h * scaleBy;
    return canvas;
  }

  const captureFrame = async (canvas: HTMLCanvasElement) => {
    // @ts-ignore
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return;
    }
    if (chatRef.current) {
      try {
        const capturedCanvas = await html2canvas(chatRef.current, {scale: 2, useCORS: true});
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);

        // Adjust the timeout to allow for better performance
        // @ts-ignore
        canvasStreamRef.current!.getVideoTracks()[0].requestFrame();
        setTimeout(() => captureFrame(canvas), 1000 / 60) // Try a lower frame rate
      } catch (error) {
        console.log("Error from capture frame", error)
      }
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
      canvasStreamRef.current.getTracks().forEach(track => {
        track.stop()
      });
    }
  };

  const downloadImage = () => {
    if (chatRef.current) {
      html2canvas(chatRef.current, {scale: 2, useCORS: true}).then((canvas) => {
        // Create an image from the canvas
        const image = canvas.toDataURL('image/png');

        // Create a link to download the image
        const downloadLink = document.createElement('a');
        downloadLink.href = image;
        downloadLink.download = 'captured-image.png';

        // Append the link to the document and trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
    }
  };

  const pdpState = useState(false)
  const [messageOptionsDisplayed, setMessageOptionsDisplayed] = useState<MessageDisplayed>({
    display: false,
    index: 0
  })

  const updateMessage = (action: MessageActions, index: number, message?: Message) => {
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
          text: message!.text,
          received: message!.received,
          displayTail: updatedMessages[index].received,
          messageTime: message!.messageTime,
          messageDate: message!.messageDate,
          imageMessage: message!.imageMessage,
          status: message!.status
        }
        setMessages(updatedMessages)
        break;
      case MessageActions.DELETE:
        setMessages(updatedMessages.filter((message, currentIndex) => currentIndex !== index));
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
                         checked={showHeaderChecked}
                         onChange={event => setShowHeaderChecked(event.target.checked)}/>
                  <label className="form-check-label" htmlFor="flexShowHeaderSwitch">Show
                    header</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="flexShowPercentageSwitch"
                         checked={showPercentageChecked}
                         onChange={event => setShowPercentageChecked(event.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="flexShowPercentageSwitch">Show
                    battery
                    percentage</label>
                </div>
                <select
                    id={"network-form"}
                    className="form-select"
                    aria-label="Default select example"
                    value={network}
                    onChange={event => setNetwork(event.target.value)}
                >
                  <option value="H+">H+</option>
                  <option value="3G">3G</option>
                  <option value="LTE">LTE</option>
                  <option value="4G">4G</option>
                  <option value="5G">5G</option>
                </select>
                <div className={"form-floating"}>
                  <input type="time"
                         className="form-control"
                         placeholder="Time"
                         id="timeFormControl"
                         value={time}
                         pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                         onChange={event => setTime(event.target.value)}
                  />
                  <label htmlFor="timeFormControl">
                    Time
                  </label>
                </div>
                <Tab.Container id="left-tabs-example" activeKey={activeTab}
                               onSelect={handleTabSelect}>
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
                                  id="person1Textarea"
                                  className="form-control"
                                  onChange={(event) =>
                                      setInputMessage(event.target.value)
                                  }/>
                        <label htmlFor="person1Textarea">Message</label>

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
                                     id="SENDING"
                                     checked={selectedMessageStatus === "SENDING"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="SENDING">
                                <SendingIcon/>
                                Sending
                              </label>
                            </div>
                          </div>
                          <div className="col">
                            <div className="form-check">
                              <input className="form-check-input" type="radio"
                                     name="flexRadioSent"
                                     id="SENT"
                                     checked={selectedMessageStatus === "SENT"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="SENT">
                                <SentIcon/>
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
                                     id="DELIVERED"
                                     checked={selectedMessageStatus === "DELIVERED"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="DELIVERED">
                                <DeliveredIcon/>
                                Delivered
                              </label>
                            </div>
                          </div>
                          <div className="col">
                            <div className="form-check">
                              <input className="form-check-input" type="radio"
                                     name="flexRadioSeen"
                                     id="SEEN"
                                     checked={selectedMessageStatus === "SEEN"}
                                     onChange={handleMessageStatusChange}
                              />
                              <label className="form-check-label" htmlFor="SEEN">
                                <SeenIcon/>
                                Seen
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="person2">
                      <div className="form-floating">
                        {imageMessage &&
                            <div className={"image-preview"}>
                              <img src={imageMessage} alt="Preview" style={{maxWidth: '250px'}}/>
                            </div>}
                        <textarea value={inputMessage}
                                  id="person2Textarea"
                                  className="form-control"
                                  onChange={(event) =>
                                      setInputMessage(event.target.value)
                                  }/>
                        <label htmlFor="person2Textarea">Message</label>
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
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
                <div className={"row"}>
                  <div className={"col"}>
                    <input type="time"
                           className="form-control"
                           placeholder="Time"
                           id="messageTimeFormControl"
                           value={messageTime}
                           pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                           onChange={event => setMessageTime(event.target.value)}
                    />
                  </div>
                  <div className={"col"}>
                    <select
                        id={"date-form"}
                        className="form-select"
                        aria-label="Select date"
                        value={date}
                        onChange={event => setDate(event.target.value)}
                    >
                      <option value="None">None</option>
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="Other">Other date</option>
                    </select>
                    {date === "Other" && (
                        <input type="date"
                               className="form-control mt-2"
                               placeholder="Time"
                               value={otherDate}
                               id="messageDateFormControl"
                               onChange={event => {
                                 setOtherDate(event.target.value)
                               }}
                        />
                    )}
                  </div>
                </div>

                <div className={"messages-input"}>
                  <div className={"row px-3"}>
                    <button className="col btn btn-primary"
                            onClick={() => {
                              sendMessage({
                                text: inputMessage,
                                received: activeTab === "person2",
                                status: MessageStatus[selectedMessageStatus as keyof typeof MessageStatus],
                                imageMessage: imageMessage,
                                displayTail: messages.length === 0 ? true : messages[messages.length - 1].received !== (activeTab === 'person2'),
                                messageTime: messageTime,
                                messageDate: date === 'Other' ? toDateInHumanFormat(new Date(otherDate)) : date
                              })
                              setImageMessage(undefined)
                            }}>Add to conversation
                    </button>
                  </div>
                </div>
                <div className={"row px-3"}>
                  <button disabled={simulateMessageOn} className="col btn btn-danger"
                          onClick={() => clearConversation()}>Clear
                  </button>
                  <button disabled={simulateMessageOn} className="col btn btn-warning"
                          onClick={() => simulateAllChat()}>Simulate
                  </button>
                  <button disabled={messages.length === 0 || simulateMessageOn}
                          className="col btn btn-outline-primary"
                          onClick={startRecording}>{waitingDownload ? `${((messages.length / messagesSim.length) * 100).toFixed(2)}%` : "Download as video"}
                  </button>
                </div>
              </div>
            </div>
            <div className="col">
              <div ref={chatRef} className="chat-container">
                {showHeaderChecked && <div className="phone-top-bar">
                  <span className="time">{time} am</span>
                  <span className="network-status">
                  <span>{network}</span>
                    <FontAwesomeIcon icon={faSignal}/>
                    {showPercentageChecked && <span>50%</span>}
                    <FontAwesomeIcon icon={faBatteryHalf}/>
            </span>

                </div>}
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
                  <div className="whatsapp-actions">
                    <span><FontAwesomeIcon
                        icon={faVideoCamera}/></span>
                    <span><FontAwesomeIcon icon={faPhone}/></span>
                    <span><FontAwesomeIcon icon={faEllipsisV}/></span>
                  </div>
                </div>
                <div className="chat-messages" id="chatMessages">
                  {messages.map((message, index) => {
                    return (
                        <MessageComponent
                            key={index}
                            index={index}
                            message={message}
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
                         contentEditable="false"
                         role="textbox"
                         aria-multiline="false"
                         data-placeholder="Type a message"
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
                <button className="btn btn-secondary" onClick={() => downloadImage()}
                        disabled={simulateMessageOn}>Download as
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
