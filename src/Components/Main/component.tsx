import React, {useCallback, useEffect, useRef, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Nav, Tab} from 'react-bootstrap';
import './styles.css'

// @ts-ignore
import html2canvas from "html2canvas";
import {PhotoProfilModale} from "../PhotoProfilModale/component";
import {MessageComponent} from "../MessageComponent/component";
import {MessageActions, MessageStatus} from "../../enums/enums";
import {Message, MessageDisplayed, ReactState} from "../../utils/types/types";
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
import {DeliveredIcon} from "../Svg/DeliveredIcon/component";
import {SentIcon} from "../Svg/SentIcon/component";
import {SendingIcon} from "../Svg/SendingIcon/component";
import {SeenIcon} from "../Svg/SeenIcon/component";
import {toDateInHumanFormat, toDateInUsFormat} from "../../utils/date/dates";

// @ts-ignore
import {FFmpeg} from "@ffmpeg/ffmpeg"
// @ts-ignore
import {fetchFile} from "@ffmpeg/util";
import useAuthState from "../../hooks/auth-state-hook";
import {loadSession} from "../../utils/localStorage/local-storage";
import {
  retrieveSessionState,
  SessionState,
  storeSessionState
} from "../../utils/indexedDB/indexed-db";
import {toStorableSessionState} from "../../mappers/session-state-mapper";

const ffmpeg = new FFmpeg()

enum FrameType {
  CHAR_TYPE,
  RECEIVER_TYPING,
  MESSAGE_SENT,
  MESSAGE_RECEIVED,
  SILENT
}

interface VideoFrame {
  frame: Blob | null;
  duration: number;
  frameType: FrameType;
  frameIndex: number;
}

export const MainComponent: React.FC<{
  authModalState: ReactState<boolean>
}> = ({authModalState}) => {

  const {currentUser} = useAuthState()

  let senderTypingSound = useRef(new Audio(require('../../sounds/typing_sound_whatsapp.mp3')));
  senderTypingSound.current.loop = true;

  let messageSentSound = useRef(new Audio(require('../../sounds/sent_sound_whatsapp.mp3')));

  let messageReceivedSound = useRef(new Audio(require('../../sounds/message_received.mp3')));

  let receiverTypingSound = useRef(new Audio(require('../../sounds/is_writing_whatsapp.mp3')));
  receiverTypingSound.current.loop = true;

  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const currentSession = loadSession()

  const [time, setTime] = useState<string>(currentSession.phoneTime)
  const [showPercentageChecked, setShowPercentageChecked] = useState(currentSession.showBatteryPercentage)
  const [showHeaderChecked, setShowHeaderChecked] = useState(currentSession.showHeader)
  const [network, setNetwork] = useState<string>(currentSession.network)
  const [receiverName, setReceiverName] = useState(currentSession.receiversName);
  const [profilePicture, setProfilePicture] = useState<any>(currentSession.profilePicture)
  const [messages, setMessages] = useState<Message[]>(currentSession.messages);

  const messagesSim = useRef<Message[]>([]);

  // Message typed by the user
  const [inputMessage, setInputMessage] = useState<string>('')
  const [receiverStatus, setReceiverStatus] = useState<string>('Online')

  const isTyping = useRef<boolean>(false);

  const typingSpeed = 30; // Speed in milliseconds
  const delayBetweenMessages = 1000;
  const responseTime = 500;
  const delayAfterConvEnd = 2000;
  const FPS = 30;

  const endOfMessagesRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [simulateMessageOn, setSimulateMessageOn] = useState(false)
  const [downloadingVideo, setDownloadingVideo] = useState(false)
  const [encodingOnProgress, setEncodingOnProgress] = useState(false)
  const [inputKey, setInputKey] = useState(Date.now());


  //** Typing props to see ** //
  const [simulateTypingMessage, setSimulateTypingMessage] = useState<boolean>(false)
  const charIndex = useRef<number>(-1)
  const frameIndex = useRef<number>(0)
  //** Typing props to see ** //

  const chatRef = useRef(null);
  const [imageMessage, setImageMessage] = useState<string | undefined>(undefined)
  const [selectedMessageStatus, setSelectedMessageStatus] = useState('SEEN'); // Default to the second radio
  const [date, setDate] = useState<string>('None')
  const [otherDate, setOtherDate] = useState<string>(toDateInUsFormat(new Date()))

  /*  */
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const videoDuration = useRef<number>(0)
  const numberOfFrames = useRef<number>(0)
  /*  */

  const videoFrames = useRef<VideoFrame[]>([]);

  const [messageTime, setMessageTime] = useState<string>('15:11')
  const [activeTab, setActiveTab] = useState('person1'); // default tab to the first person
  const canvas = document.createElement('canvas');

  // load sessionStorage
  useEffect(() => {
    retrieveSessionState().then(sessionFromIndexedDB => {
      if (!sessionFromIndexedDB) return
      setTime(sessionFromIndexedDB.phoneTime)
      setShowPercentageChecked(sessionFromIndexedDB.showBatteryPercentage)
      setShowHeaderChecked(sessionFromIndexedDB.showHeader)
      setNetwork(sessionFromIndexedDB.network)
      setReceiverName(sessionFromIndexedDB.receiversName)
      setProfilePicture(sessionFromIndexedDB.profilePicture)
      setMessages(sessionFromIndexedDB.messages)
    })
    // Empty dependency array means this effect runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabSelect = (key: any) => {
    setActiveTab(key);
  };

  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputKey(Date.now())
  }, [imageMessage])

  // Save session
  useEffect(() => {
    const session = {
      messages: messages,
      network: network,
      phoneTime: time,
      receiversName: receiverName,
      showBatteryPercentage: showPercentageChecked,
      showHeader: showHeaderChecked,
      profilePicture: profilePicture
    } as SessionState

    // saveSession(session)
    toStorableSessionState(session).then(storableSession => {
      storeSessionState(storableSession)
    })
  }, [messages, network, receiverName, profilePicture, showHeaderChecked, showPercentageChecked, time]);

  const handleMessageStatusChange = (event: any) => {
    setSelectedMessageStatus(event.target.id);
  };

  const clearConversation = () => {
    setMessages([])
    setRecordedChunks([])
    videoFrames.current = []
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
      setMessages(current => [...current, newMessage])
      // @ts-ignore
      setInputMessage('')
    }
  }, [])

  const convertFramesToVideo = async () => {
    try {
      console.log('how?')
      setEncodingOnProgress(true)
      console.time('preparing-convert')
      // Load the FFmpeg core
      await ffmpeg.load();

      // Initialize a variable to store the concat demuxer file content
      let concatFileContent = '';

      // interactions strats after 1 second,
      let videoTime = 0;
      let filterComplex = '';
      let audioMix: string[] = [];
      const timeAndDuration = getConsecutiveOccurrences(
          videoFrames.current
          .sort((a, b) => a.frameIndex - b.frameIndex)
          .map(frame => frame.frameType))

      timeAndDuration.forEach((timeAndDuration, index) => {
        if (timeAndDuration.frameType === FrameType.SILENT) {
          videoTime += timeAndDuration.nbFrames * delayBetweenMessages // TODO change with videoFrame.duration (refacto)
        } else if (timeAndDuration.frameType === FrameType.CHAR_TYPE) {
          const duration = (timeAndDuration.nbFrames * typingSpeed)
          filterComplex += `;[1:a]aloop=loop=-1:size=2e+09,atrim=duration=${duration / 1000},adelay=${videoTime}|${videoTime},asetpts=N/SR/TB[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        } else if (timeAndDuration.frameType === FrameType.MESSAGE_SENT) {
          const duration = delayBetweenMessages
          filterComplex += `;[2:a]adelay=${videoTime}|${videoTime}[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        } else if (timeAndDuration.frameType === FrameType.RECEIVER_TYPING) {
          const duration = delayBetweenMessages
          filterComplex += `;[4:a]adelay=${videoTime}|${videoTime}[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        } else if (timeAndDuration.frameType === FrameType.MESSAGE_RECEIVED) {
          const duration = delayBetweenMessages
          filterComplex += `;[3:a]adelay=${videoTime}|${videoTime}[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        }

      })

      // set video duration in ms
      videoDuration.current = videoTime
      numberOfFrames.current = FPS * (videoTime / 1000)
      console.log("Estimated number of frames: ", numberOfFrames.current)
      console.log("Estimated duration", videoDuration.current)

      // Write frames to FFmpeg's virtual file system and build the concat file content
      for (let index = 0; index < videoFrames.current.length; index++) {
        const videoFrame = videoFrames.current[index];
        const data = await fetchFile(videoFrame.frame!);
        await ffmpeg.writeFile(`frame${index}.jpg`, data);

        // Add each frame and its duration to the concat file content
        // Assuming each image should be displayed for 2 seconds
        concatFileContent += `file 'frame${index}.jpg'\nduration ${videoFrame.duration}\n`;
      }

      // Add the last file again without specifying duration to avoid freezing on the last frame
      if (videoFrames.current.length > 0) {
        concatFileContent += `file 'frame${videoFrames.current.length - 1}.jpg'\n`;
      }

      // Write the concat file content to FFmpeg's virtual file system
      await ffmpeg.writeFile('input.txt', concatFileContent);

      // Write audio files, assuming they are accessible similar to videoFrames
      const senderTypingSound = await fetchFile(require('../../sounds/typing_sound_5s.mp3'));
      let messageSentSound = await fetchFile(require('../../sounds/sent_sound_whatsapp.mp3'));
      let messageReceivedSound = await fetchFile(require('../../sounds/message_received.mp3'));
      let receiverTypingSound = await fetchFile(require('../../sounds/is_writing_whatsapp_original_2s.mp3'));
      await ffmpeg.writeFile('sender_typing_sound.mp3', senderTypingSound);
      await ffmpeg.writeFile('message_sent.mp3', messageSentSound);
      await ffmpeg.writeFile('message_received.mp3', messageReceivedSound);
      await ffmpeg.writeFile('receiver_typing_sound.mp3', receiverTypingSound);

      filterComplex = `[0:v]setpts=PTS-STARTPTS,fps=${FPS}[v]` + filterComplex + `;${audioMix.join('')}amix=inputs=${audioMix.length}[audio_mix]`
      // Execute the FFmpeg command using the concat demuxer to convert the images to a video
      console.timeEnd('preparing-convert')

      console.time('exec-execution-time')
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'input.txt', // Video input from concatenated images
        '-i', 'sender_typing_sound.mp3', // Audio input
        '-i', 'message_sent.mp3', // Audio input
        '-i', 'message_received.mp3', // Audio input
        '-i', 'receiver_typing_sound.mp3', // Audio input
        '-filter_complex', filterComplex, // Corrected filter_complex
        '-map', '[v]',
        '-map', '[audio_mix]',
        '-shortest',
        '-c:v', 'libx264', // Video codec
        '-pix_fmt', 'yuv420p', // Pixel format specified once
        '-c:a', 'aac', // Audio codec
        'out.mp4' // Output file
      ]);

      console.timeEnd('exec-execution-time')

      console.log("after exec")

      // Read the generated video file from the virtual file system
      const data = await ffmpeg.readFile('out.mp4');

      console.log("after readFile out.mp4")

      // Create a URL for the video file
      const videoURL = URL.createObjectURL(new Blob([data], {type: 'video/mp4'}));
      console.log("videoUrl", videoURL);

      // Use this videoURL to display the video or download it
      downloadRecording(videoURL);

      setEncodingOnProgress(false)
      // downloadWithProgress(videoURL)
    } catch (e) {
      console.log(e)
    }
  };

  useEffect(() => {
        if (!simulateMessageOn && downloadingVideo) {
          convertFramesToVideo()
          setDownloadingVideo(false)
          setDownloadProgress(0)
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [downloadingVideo, simulateMessageOn])

  const captureFrameFbF = (frameType: FrameType, frameDuration: number) => {
    if (!downloadingVideo) return;
    if (chatRef.current) {
      try {
        console.time("time-to-html2canvas")
        const frame: Partial<VideoFrame> = {
          frameIndex: frameIndex.current++
        };
        html2canvas(chatRef.current, {
          scale: 2,
          logging: false
        }).then(capturedCanvas => {
          capturedCanvas.toBlob(blob => {
            videoFrames.current.push({
              ...frame,
              frame: blob,
              frameType: frameType,
              duration: frameDuration / 1000
            } as VideoFrame);
          }, 'image/jpeg', 0.6); // Adjust quality as needed
        })
        console.timeEnd("time-to-html2canvas")
      } catch (error) {
        console.log("Error from capture frame", error);
      }
    }
    return false;
  };

  // useEffect to capture a frame with "Typing"
  useEffect(() => {
    if (receiverStatus === 'Typing') {
      captureFrameFbF(FrameType.RECEIVER_TYPING, delayBetweenMessages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverStatus])

  // scroll to bottom in typing area
  const scrollToBottom = () => {
    inputRef.current!.scrollTop = inputRef.current!.scrollHeight;
  }

  // simulateTypingMessage
  useEffect(() => {
    const captureCharAndProceed = async () => {
      // update input
      const currentMessage = messagesSim.current[currentMessageIndex]
      if (simulateTypingMessage && currentMessage) {
        // captureFrame
        // if not first render, captureFrame
        charIndex.current++
        if (charIndex.current !== 0) {
          captureFrameFbF(FrameType.CHAR_TYPE, typingSpeed)
        }
        // type next letter
        if (charIndex.current < currentMessage.text!.length) {
          setTimeout(() => {
            scrollToBottom()
            setInput(prev => {
              return prev + currentMessage.text![charIndex.current]
            })
          }, typingSpeed)
        } else {
          // reset charIndex
          charIndex.current = -1
          setSimulateTypingMessage(false)
          senderTypingSound.current.pause()

          // Wait, then move to the next message
          setTimeout(() => {
            sendMessage({
              displayTail: currentMessageIndex === 0 ? true : messages[currentMessageIndex - 1].received,
              text: input,
              received: false,
              imageMessage: currentMessage.imageMessage,
              status: currentMessage.status,
              messageTime: currentMessage.messageTime,
              messageDate: currentMessage.messageDate
            })
            setInput('')
            messageSentSound.current.play()
            setCurrentMessageIndex(prev => prev + 1)
            if (currentMessageIndex === messagesSim.current.length - 1) {
              setTimeout(() => {
                setSimulateMessageOn(false)
              }, delayAfterConvEnd)
            }
          }, delayBetweenMessages);
        }
      }
    }
    captureCharAndProceed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulateTypingMessage, input])

  const playMessage = () => {
    try {
      // functions
      const simulateReceivingMessage = (message: Message) => {
        receiverTypingSound.current.play()
        setReceiverStatus('Typing')
        setTimeout(() => {
          receiverTypingSound.current.pause()
          receiverTypingSound.current.currentTime = 0;
          sendMessage({
            text: message.text,
            received: true,
            imageMessage: message.imageMessage,
            status: message.status,
            displayTail: currentMessageIndex === 0 ? true : !messages[currentMessageIndex - 1].received,
            messageTime: message.messageTime,
            messageDate: message.messageDate
          })
          messageReceivedSound.current.play()
          setReceiverStatus('Online')
          setCurrentMessageIndex(prev => prev + 1)

          if (currentMessageIndex === messagesSim.current.length - 1) {
            setTimeout(() => {
              setSimulateMessageOn(false)
            }, delayAfterConvEnd)
          }
        }, responseTime)
      }

      // launches useEffect
      const simulateTypingMessage = () => {
        senderTypingSound.current.play()
        setSimulateTypingMessage(true)
      }

      const simulateSendingImage = (message: Message) => {
        senderTypingSound.current.pause();
        sendMessage(message)
        messageSentSound.current.play();
        setCurrentMessageIndex(prev => prev + 1)
        if (currentMessageIndex === messagesSim.current.length - 1) {
          setTimeout(() => {
            setSimulateMessageOn(false)
          }, delayAfterConvEnd)
        }
      }

      const simulateRecevingImage = (message: Message) => {
        senderTypingSound.current.pause();
        sendMessage(message)
        messageSentSound.current.play();
        setCurrentMessageIndex(prev => prev + 1)
        if (currentMessageIndex === messagesSim.current.length - 1) {
          setTimeout(() => {
            setSimulateMessageOn(false)
          }, delayAfterConvEnd)
        }
      }

      // **** Add frame of delay between messages *****
      if (currentMessageIndex === 0) {
        captureFrameFbF(FrameType.SILENT, delayBetweenMessages)
      }

      if (currentMessageIndex > 0 && isTyping.current && messagesSim.current.length > 0) {
        if (messagesSim.current[currentMessageIndex - 1].imageMessage) {
          if (messagesSim.current[currentMessageIndex - 1].received) {
            captureFrameFbF(FrameType.MESSAGE_RECEIVED, delayBetweenMessages)
          } else {
            captureFrameFbF(FrameType.MESSAGE_SENT, delayBetweenMessages)
          }
        } else {
          if (messagesSim.current[currentMessageIndex - 1].received) {
            captureFrameFbF(FrameType.MESSAGE_RECEIVED, delayBetweenMessages)
          } else {
            captureFrameFbF(FrameType.MESSAGE_SENT, delayBetweenMessages)
          }
        }
      }
      // **** End *****

      if (currentMessageIndex >= messagesSim.current.length) {
        isTyping.current = false
        return;
      }

      if (isTyping.current && currentMessageIndex < messagesSim.current.length) {
        setTimeout(() => {
          const message = messagesSim.current[currentMessageIndex];
          if (!message.received) {
            if (message.text) {
              simulateTypingMessage()
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
        }, delayBetweenMessages)
      }
    } catch (error) {
      console.log("Error from useEffect", error)
    }
  }

  // useEffect to simulate the chat
  useEffect(() => {
    playMessage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessageIndex]);

  const simulateAllChat = () => {
    if (messages.length < 1) return;
    // TODO hide all options
    setSimulateMessageOn(true)

    /*    setMessagesSim(
            messages.map(message => message)
        )*/
    messagesSim.current = messages
    setMessages([])
    if (!isTyping.current) {
      isTyping.current = true
      setCurrentMessageIndex(0)
      setInput('')
    }
  };

  const downloadRecording = useCallback((url?: string) => {
    const blob = new Blob(recordedChunks, {type: 'video/mp4'});
    if (!url) {
      url = URL.createObjectURL(blob);
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.mp4';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [recordedChunks])

  let startRecording = () => {
    if (!currentUser) {
      authModalState[1](true)
      return
    }

    videoFrames.current = []
    setDownloadingVideo(true)
    try {
      //start animation
      setRecordedChunks([]);
      simulateAllChat();

      // Set canvas dimensions
      // @ts-ignore
      canvas.width = chatRef.current!.offsetWidth;
      // @ts-ignore
      canvas.height = chatRef.current!.offsetHeight;

    } catch (error) {
      console.log("Error log from startRecording", error);
    }
  }

  const extractFrame = (stderrLine: string): number | null => {
    const match = stderrLine.match(/frame=\s*(\d+)/);
    const frame = match ? match[1] : null;
    if (time) {
      return Number(frame)
    }
    return null
  }

  ffmpeg.on("log", ({type, message}) => {
    const parsedFrame = extractFrame(message)
    if (parsedFrame && numberOfFrames.current) {
      setDownloadProgress(Math.min(Math.round((parsedFrame / numberOfFrames.current) * 100), 100))
    }

    /*    const parsedMessage = extractTime(message)
        if (parsedMessage && videoDuration.current) {
          setDownloadProgress(Math.min(Math.round((parsedMessage / videoDuration.current) * 100), 100))
        }*/
  })
  /*    const parsedMessage = extractTime(message)
      if (parsedMessage && videoDuration.current) {
        setDownloadProgress(Math.min(Math.round((parsedMessage / videoDuration.current) * 100), 100))
      }*/
  const getConsecutiveOccurrences = (list: FrameType[]): {
    frameType: FrameType,
    index: number,
    nbFrames: number
  }[] => {
    const result: Array<{ frameType: FrameType, index: number, nbFrames: number }> = [];
    let current = list[0];
    let count = 1;
    let index = 0;

    for (let i = 1; i <= list.length; i++) {
      if ((list[i] === FrameType.CHAR_TYPE) && list[i] === current && i < list.length) {
        count++;
      } else {
        result.push({frameType: current, index: index, nbFrames: count});
        current = list[i];
        index = i;
        count = 1;
      }
    }

    return result;
  }

  const downloadImage = () => {
    if (chatRef.current) {
      html2canvas(chatRef.current, {scale: 2, useCORS: true, logging: false}).then((canvas) => {
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
    const messagesLength = messages.length
    index = messagesLength - index - 1

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
          index: messages.length - 2 - index,
          display: true
        })
        setMessages(swapElements(index, index + 1))
        break;
      case MessageActions.UP:
        if (updatedMessages.length <= 1 || index === 0) return;
        setMessageOptionsDisplayed({
          index: messages.length - index,
          display: true
        })
        setMessages(swapElements(index, index - 1))
        break;
      case MessageActions.LEFT:
      case MessageActions.RIGHT:
        updatedMessages[index] = {
          ...updatedMessages[index],
          received: !updatedMessages[index].received,
          displayTail: index === 0 ? true : updatedMessages[index].received === updatedMessages[index - 1].received,

        }
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
                               setProfilePictureSrcState={[profilePicture, setProfilePicture]}/>
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
                    <button className="col btn btn-success"
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
                <div className={"row px-3 gap-2"}>
                  <button disabled={simulateMessageOn} className="col btn btn-danger"
                          onClick={() => clearConversation()}>Clear
                  </button>
                  <button disabled={simulateMessageOn} className="col btn btn-primary"
                          onClick={() => {
                            simulateAllChat()
                          }
                          }>Play
                  </button>
                  <button
                      disabled={messages.length === 0 || simulateMessageOn || encodingOnProgress}
                      className="col btn btn-info"
                      onClick={startRecording}>

                    {downloadingVideo &&
                        <span className="spinner-grow spinner-grow-sm mx-2" role="status"
                              aria-hidden="true"/>}
                    Get video
                  </button>
                </div>
              </div>
            </div>
            <div className="col">
              <div className={"chat-blurry-container"}>
                <div ref={chatRef}
                     className={`chat-container ${(downloadingVideo || encodingOnProgress) ? 'blur' : ''}`}>
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
                      <img className="profile-pic" src={profilePicture}
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
                  <div className="chat-messages chat-messages-container" id="chatMessages">
                    {
                      messages.slice().reverse().map((message, index) => {
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
                      <span id="messageInput"
                            ref={inputRef}
                            className={"editable-div"}
                            role="textbox"
                            aria-multiline="false"
                            data-placeholder="Type a message"
                      >{input}
                      </span>
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
                    {input ? <span className={"icon-right-arrow center-icon"}/> :
                        <span className={"icon-microphone center-icon"}/>}
                  </div>
                  </span>
                  </div>}
                </div>
                {downloadingVideo && (
                    <div className="spinner-container">
                      <div className="d-flex flex-column align-items-center">
                        <div className="spinner-border" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <strong>{`Recording messages ${messages.length}/${messagesSim.current.length}`}</strong>
                      </div>
                    </div>
                )}
                {encodingOnProgress && (
                    <div className="spinner-container">
                      <div className="d-flex flex-column align-items-center">
                        <div className="spinner-border" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <strong>Encoding video {downloadProgress}%</strong>
                      </div>
                    </div>
                )}
              </div>
              <div className={"generate-buttons"}>
                <button className="btn btn-primary" onClick={() => downloadImage()}
                        disabled={simulateMessageOn}>Download as
                  Image
                </button>

                <button disabled={messages.length === 0 || simulateMessageOn || encodingOnProgress}
                        className="btn btn-info"
                        onClick={startRecording}>

                  {downloadingVideo &&
                      <span className="spinner-grow spinner-grow-sm mx-2" role="status"
                            aria-hidden="true"/>}
                  Get video
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
  )
}