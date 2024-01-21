import {Modal, ModalBody, ModalHeader, Nav, Tab} from "react-bootstrap";
import {Message, ReactState} from "../../utils/types/types";
import React, {useEffect, useRef, useState} from "react";
import {MessageStatus} from "../../enums/enums";
import {fromHumanToUsFormat, toDateInHumanFormat, toDateInUsFormat} from "../../utils/date/dates";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleXmark, faImage} from "@fortawesome/free-solid-svg-icons";
import {SendingIcon} from "../Svg/SendingIcon/component";
import {SentIcon} from "../Svg/SentIcon/component";
import {DeliveredIcon} from "../Svg/DeliveredIcon/component";
import {SeenIcon} from "../Svg/SeenIcon/component";

export const UpdateMessage: React.FC<{
  updateModalOpenState: ReactState<boolean>,
  message: Message,
  updateMessage: (message: Message) => void,
}> = ({
        updateModalOpenState,
        message,
        updateMessage
      }) => {

  const imageInputRef = useRef<HTMLInputElement>(null)

  const [currentMessage, setCurrentMessage] = useState(message)
  const [updateModalOpen, setUpdateModalOpen] = updateModalOpenState;
  const [date, setDate] = useState<string>('')
  const [otherDate, setOtherDate] = useState<string | undefined>()
  const [inputKey, setInputKey] = useState(Date.now());

  useEffect(() => {
    if (currentMessage.messageDate) {
      if (['Yesterday', 'Today', 'None'].includes(currentMessage.messageDate)) {
        setDate(currentMessage.messageDate)
        return;
      }
      setDate('Other')
      setOtherDate(fromHumanToUsFormat(currentMessage.messageDate))
    }
  }, [currentMessage.messageDate])

  useEffect(() => {
    setCurrentMessage(message)
  }, [message])

  const handleTabSelect = (key: any) => {
    setCurrentMessage({
      ...currentMessage,
      received: key === "person2"
    })
  };

  const handleUploadImage = () => {
    imageInputRef.current!.click();
  }

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file && file.type.substr(0, 5) === 'image') {
      setCurrentMessage({
        ...currentMessage,
        imageMessage: URL.createObjectURL(file)
      })
    }
  };

  useEffect(() => {
    setInputKey(Date.now())
  }, [currentMessage.imageMessage])

  const handDateChange = (date: string) => {
    if (date === 'Other') {
      setOtherDate(toDateInUsFormat(new Date()))
    }
    setDate(date)
  }

  return (<>
    <Modal open={true}
           show={updateModalOpen}
           onHide={() => {
           }}
           aria-labelledby="Update message"
           aria-describedby="Update message"
    >
      <ModalHeader>
        Update message
        <div className={"d-flex"}>
          <span className={"btn"} onClick={() => setUpdateModalOpen(false)}><FontAwesomeIcon
              icon={faCircleXmark} color={"red"}/></span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="d-flex flex-column gap-2">
          <Tab.Container id="left-tabs-example"
                         activeKey={currentMessage.received ? "person2" : "person1"}
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
                  {currentMessage.imageMessage &&
                      <div className={"image-preview"}>
                        <img src={currentMessage.imageMessage} alt="Preview"
                             style={{maxWidth: '250px'}}/>
                      </div>}
                  <textarea value={currentMessage.text}
                            id="person1Textarea"
                            className="form-control"
                            onChange={(event) =>
                                setCurrentMessage({
                                  ...currentMessage,
                                  text: event.target.value
                                })
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
                               name="flexRadioUpdateSending"
                               id="flexRadioUpdateSending"
                               checked={currentMessage.status === MessageStatus.SENDING}
                               onChange={() =>
                                   setCurrentMessage({
                                     ...currentMessage,
                                     status: MessageStatus.SENDING
                                   })}
                        />
                        <label className="form-check-label" htmlFor="flexRadioUpdateSending">
                          <SendingIcon/>
                          Sending
                        </label>
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-check">
                        <input className="form-check-input" type="radio"
                               name="flexRadioUpdateSent"
                               id="flexRadioUpdateSent"
                               checked={currentMessage.status === MessageStatus.SENT}
                               onChange={() =>
                                   setCurrentMessage({
                                     ...currentMessage,
                                     status: MessageStatus.SENT
                                   })}
                        />
                        <label className="form-check-label" htmlFor="flexRadioUpdateSent">
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
                               name="flexRadioUpdateDelivered"
                               id="flexRadioUpdateDelivered"
                               checked={currentMessage.status === MessageStatus.DELIVERED}
                               onChange={() =>
                                   setCurrentMessage({
                                     ...currentMessage,
                                     status: MessageStatus.DELIVERED
                                   })}
                        />
                        <label className="form-check-label" htmlFor="flexRadioUpdateDelivered">
                          <DeliveredIcon/>
                          Delivered
                        </label>
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-check">
                        <input className="form-check-input" type="radio"
                               name="flexRadioUpdateSeen"
                               id="flexRadioUpdateSeen"
                               checked={currentMessage.status === MessageStatus.SEEN}
                               onChange={() =>
                                   setCurrentMessage({
                                     ...currentMessage,
                                     status: MessageStatus.SEEN
                                   })}
                        />
                        <label className="form-check-label" htmlFor="flexRadioUpdateSeen">
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
                  {currentMessage.imageMessage &&
                      <div className={"image-preview"}>
                        <img src={currentMessage.imageMessage} alt="Preview"
                             style={{maxWidth: '250px'}}/>
                      </div>}
                  <textarea value={currentMessage.text}
                            id="person2Textarea"
                            className="form-control"
                            onChange={(event) =>
                                setCurrentMessage({
                                  ...currentMessage,
                                  text: event.target.value
                                })
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
                     value={currentMessage.messageTime}
                     pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                     onChange={event => setCurrentMessage({
                       ...currentMessage,
                       messageTime: event.target.value
                     })}
              />
            </div>
            <div className={"col"}>
              <select
                  id={"date-form"}
                  className="form-select"
                  aria-label="Select date"
                  value={date}
                  onChange={event => handDateChange(event.target.value)}
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
                        updateMessage({
                          ...currentMessage,
                          messageDate: date === 'Other' ? toDateInHumanFormat(new Date(otherDate!)) : date
                        })
                        setUpdateModalOpen(false)
                      }}>Apply changes
              </button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  </>)
}