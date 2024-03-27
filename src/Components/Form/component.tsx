import {Nav, Tab} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faImage,
  faPlay,
  faRotateRight,
  faSquarePlus
} from "@fortawesome/free-solid-svg-icons";
import {SendingIcon} from "../Svg/SendingIcon/component";
import {SentIcon} from "../Svg/SentIcon/component";
import {DeliveredIcon} from "../Svg/DeliveredIcon/component";
import {SeenIcon} from "../Svg/SeenIcon/component";
import {MessageStatus} from "../../enums/enums";
import {toDateInHumanFormat, toDateInUsFormat} from "../../utils/date/dates";
import React, {useEffect, useRef, useState} from "react";
import {MAX_TYPING_DELAY, Message, MIN_TYPING_DELAY} from "../../utils/types/types";
import {observer} from "mobx-react-lite";
import {useStores} from "../../store";

export const FormComponent: React.FC<{
  sendMessage: (message: Message) => void,
  clearChat: () => void,
  simulateAllChat: () => void
  startRecording: () => void
}> =
    observer(({sendMessage, clearChat, simulateAllChat, startRecording}) => {

      //Refs
      const imageInputRef = useRef<HTMLInputElement>(null)

      //Store
      const {appStore} = useStores()
      const {
        time,
        encodingOnProgress,
        simulateMessageOn,
        downloadingVideo,
        showHeaderChecked,
        showPercentageChecked,
        network,
        messages,
        videoFormat,
        receiverName,
        typingSpeed,
        setShowHeaderChecked,
        setShowPercentageChecked,
        setNetwork,
        setReceiverName,
        setVideoFormat,
        setTime,
        setTypingSpeed
      } = appStore

      //States
      const [messageTime, setMessageTime] = useState<string>('15:11')
      const [activeTab, setActiveTab] = useState('person1'); // default tab to the first person
      const [selectedMessageStatus, setSelectedMessageStatus] = useState('SEEN'); // Default to the second radio
      const [date, setDate] = useState<string>('None')
      const [otherDate, setOtherDate] = useState<string>(toDateInUsFormat(new Date()))
      const [inputKey, setInputKey] = useState(Date.now());
      const [inputMessage, setInputMessage] = useState<string>('')
      const [imageMessage, setImageMessage] = useState<Blob | undefined>(undefined)

      const handleTabSelect = (key: any) => {
        setActiveTab(key);
      };

      const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        if (file && file.type.substr(0, 5) === 'image') {
          setImageMessage(file)
        }
      };

      const handleUploadImage = () => {
        imageInputRef.current!.click();
      }

      const handleMessageStatusChange = (event: any) => {
        setSelectedMessageStatus(event.target.id);
      };

      const handleTypingSpeed = (event: any) => {
        setTypingSpeed(event.target.value)
      }

      useEffect(() => {
        setInputKey(Date.now())
      }, [imageMessage])


      return <div className={"left-container box-shadow p-2"}>
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

        <div>
          <label htmlFor="videoFormat" className={"m-2"}>Video format</label>
          <div id="videoFormat" className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="inlineRadioOptions"
                   id="verticalAspectRatio" value="VERTICAL"
                   checked={videoFormat === "VERTICAL"}
                   onChange={event => setVideoFormat(event.target.value)}/>
            <label className="form-check-label"
                   htmlFor="verticalAspectRatio">Vertical</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="inlineRadioOptions"
                   id="squareAspectRatio" value="SQUARE"
                   checked={videoFormat === "SQUARE"}
                   onChange={event => setVideoFormat(event.target.value)}/>
            <label className="form-check-label" htmlFor="squareAspectRatio">Square</label>
          </div>
        </div>

        <div>
          <label htmlFor="typingSpeed" className="form-label">Typing
            speed</label>: {Math.ceil(1000 / (Math.abs(typingSpeed - MAX_TYPING_DELAY) + MIN_TYPING_DELAY))} chars
          /
          second
          <input type="range" className="form-range" min={MIN_TYPING_DELAY} max={MAX_TYPING_DELAY}
                 id="typingSpeed"
                 onChange={handleTypingSpeed}/>
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
                      <img src={URL.createObjectURL(imageMessage)} alt="Preview"
                           style={{maxWidth: '250px'}}/>
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
                      <img src={URL.createObjectURL(imageMessage)} alt="Preview"
                           style={{maxWidth: '250px'}}/>
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
            <button className="col btn btn-success"
                    disabled={simulateMessageOn || downloadingVideo || encodingOnProgress}
                    onClick={() => {
                      sendMessage({
                        displayTail: messages.length === 0 ? true : messages[messages.length - 1].received !== (activeTab === 'person2'),
                        text: inputMessage,
                        received: activeTab === "person2",
                        status: MessageStatus[selectedMessageStatus as keyof typeof MessageStatus],
                        imageMessage: imageMessage,
                        messageTime: messageTime,
                        messageDate: date === 'Other' ? toDateInHumanFormat(new Date(otherDate)) : date
                      })
                      setImageMessage(undefined)
                    }}>Add to conversation
              <FontAwesomeIcon className={"ms-2"} icon={faSquarePlus}/>
            </button>
          </div>
        </div>
        <div className={"row px-3 gap-2"}>
          <button disabled={simulateMessageOn} className="col btn btn-danger"
                  onClick={() => clearChat()}>Reset
            <FontAwesomeIcon className={"ms-2"} icon={faRotateRight}/>
          </button>
          <button disabled={messages.length === 0 || simulateMessageOn || encodingOnProgress}
                  className="col btn btn-outline-primary"
                  onClick={() => {
                    simulateAllChat()
                  }
                  }>Play
            <FontAwesomeIcon className={"ms-2"} icon={faPlay}></FontAwesomeIcon>
          </button>
          <button
              disabled={messages.length === 0 || simulateMessageOn || encodingOnProgress}
              className="col btn btn-info"
              onClick={startRecording}>

            Get video
            {
              downloadingVideo ?
                  <span className="spinner-grow spinner-grow-sm mx-2" role="status"
                        aria-hidden="true"/> :
                  <FontAwesomeIcon className={"ms-2"} icon={faDownload}></FontAwesomeIcon>
            }
          </button>
        </div>
      </div>
    })