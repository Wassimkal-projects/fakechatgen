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

// @ts-ignore
import {FFmpeg} from "@ffmpeg/ffmpeg"
// @ts-ignore
import {fetchFile} from "@ffmpeg/util";

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
}

function App() {
  let senderTypingSound = useRef(new Audio(require('./sounds/typing_sound_whatsapp.mp3')));
  senderTypingSound.current.loop = true;

  let messageSentSound = useRef(new Audio(require('./sounds/sent_sound_whatsapp.mp3')));

  let messageReceivedSound = useRef(new Audio(require('./sounds/message_received.mp3')));

  let receiverTypingSound = useRef(new Audio(require('./sounds/is_writing_whatsapp.mp3')));
  receiverTypingSound.current.loop = true;

  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);

  const inputRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')


  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesSim, setMessagesSim] = useState<Message[]>([]);

  // Message typed by the user
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
  const [downloadingVideo, setDownloadingVideo] = useState(false)
  const [inputKey, setInputKey] = useState(Date.now());


  //** Typing props to see ** //
  const [simulateTypingMessage, setSimulateTypingMessage] = useState<boolean>(false)
  const [charIndex, setCharIndex] = useState<number>(0)

  //** Typing props to see ** //

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

  /*  */
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  /*  */

  const videoFrames = useRef<VideoFrame[]>([]);

  const [time, setTime] = useState<string>('15:11')
  const [messageTime, setMessageTime] = useState<string>('15:11')
  const [activeTab, setActiveTab] = useState('person1'); // default tab to the first person
  const canvas = document.createElement('canvas');

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
    videoFrames.current = []
  }

  const sendMessage = useCallback((message: Message) => {
    console.log(message.text)
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
        if (!simulateMessageOn) {
          setDownloadingVideo(false)
        }
      },
      [simulateMessageOn])

  const captureFrameFbF = async (frameType: FrameType, frameDuration?: number) => {
    if (!downloadingVideo) return;
    if (chatRef.current) {
      try {
        const capturedCanvas = await html2canvas(chatRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        capturedCanvas.toBlob(blob => {
          videoFrames.current.push({
            frame: blob,
            frameType: frameType,
            duration: frameDuration ? (frameDuration / 1000) : 0.2 //TODO default ?
          })
        }, 'image/jpeg', 0.95); // Adjust quality as needed
        /*        const ctx = canvas.getContext('2d')!;
                ctx.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);

                // @ts-ignore
                canvasStreamRef.current!.getVideoTracks()[0].requestFrame();*/
      } catch (error) {
        console.log("Error from capture frame", error)
      }
    }
    return false
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
    //TODO make it conditional to the length
    // input!.scrollTop = input!.scrollHeight;
    inputRef.current!.scrollTop = inputRef.current!.scrollHeight;
  }

  // useEffect to simulate the chat
  // simulateTypingMessage
  useEffect(() => {
    // update input
    const currentMessage = messagesSim[currentMessageIndex]
    if (simulateTypingMessage && currentMessage) {
      // captureFrame
      // if not first render, captureFrame
      if (charIndex !== 0) {
        captureFrameFbF(FrameType.CHAR_TYPE, typingSpeed)
      }
      // type next letter
      if (charIndex < currentMessage.text!.length) {
        setTimeout(() => {
          scrollToBottom()
          setInput(prev => prev + currentMessage.text![charIndex])
          setCharIndex(prevState => prevState + 1);
        }, typingSpeed)
      } else {
        // reset charIndex
        setCharIndex(0)
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
          messageSentSound.current.play().then(() => {
            setCurrentMessageIndex(currentMessageIndex + 1);
          });
          if (currentMessageIndex === messagesSim.length - 1) {
            setTimeout(() => {
              setSimulateMessageOn(false)
              stopRecording();
            }, 2000)
          }
        }, delayBetweenMessages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulateTypingMessage, input])

  useEffect(() => {
    try {
      // functions
      const simulateReceivingMessage = (message: Message) => {
        receiverTypingSound.current.play().then(() => {
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
            messageReceivedSound.current.play().then(() => {
              setReceiverStatus('Online')
              setCurrentMessageIndex(currentMessageIndex + 1);
            });

            if (currentMessageIndex === messagesSim.length - 1) {
              setTimeout(() => {
                setSimulateMessageOn(false)
                stopRecording();
              }, 2000)
            }
          }, responseTime)
        })
      }

      // should be in separate useEffect
      const simulateTypingMessage = (message: Message) => {
        senderTypingSound.current.play().then(() => {

          /*          let index = 0;
                    const scrollToBottom = () => {
                      //TODO make it conditional to the length
                      // input!.scrollTop = input!.scrollHeight;
                      inputRef.current!.scrollTop = inputRef.current!.scrollHeight;
                    }*/
          setSimulateTypingMessage(true)

          /*const typeChar = () => {
            if (index < message.text!.length) {
              // input!.textContent = input!.textContent + message.text!.charAt(index);
              setInput(prev => {
                return prev + message.text!.charAt(index)
              })

              scrollToBottom();
              index++;
              setTimeout(() => {
                captureFrameFbF(FrameType.CHAR_TYPE, typingSpeed)
                typeChar()
              }, typingSpeed);
            } else {
              // End sound after a message is complete
              senderTypingSound.current.pause()

              // Wait, then move to the next message
              setTimeout(() => {
                sendMessage({
                  displayTail: currentMessageIndex === 0 ? true : messages[currentMessageIndex - 1].received,
                  text: input,
                  received: false,
                  imageMessage: message.imageMessage,
                  status: message.status,
                  messageTime: message.messageTime,
                  messageDate: message.messageDate
                })
                // input!.textContent = '';
                setInput('')
                messageSentSound.current.play().then(() => {
                  setCurrentMessageIndex(currentMessageIndex + 1);
                });
                if (currentMessageIndex === messagesSim.length - 1) {
                  setTimeout(() => {
                    setSimulateMessageOn(false)
                    stopRecording();
                  }, 2000)
                }
              }, delayBetweenMessages);
            }
          };*/
          // typeChar();
        });

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

      // **** Add frame of delay between messages *****
      if (currentMessageIndex === 0) {
        captureFrameFbF(FrameType.SILENT, delayBetweenMessages)
      }
      if (currentMessageIndex > 0 && isTyping && messagesSim.length > 0) {
        if (messagesSim[currentMessageIndex - 1].imageMessage) {
          setTimeout(() => {
            if (messagesSim[currentMessageIndex - 1].received) {
              captureFrameFbF(FrameType.MESSAGE_RECEIVED, delayBetweenMessages)
            } else {
              captureFrameFbF(FrameType.MESSAGE_SENT, delayBetweenMessages)
            }
          }, 500)
        } else {
          if (messagesSim[currentMessageIndex - 1].received) {
            captureFrameFbF(FrameType.MESSAGE_RECEIVED, delayBetweenMessages)
          } else {
            captureFrameFbF(FrameType.MESSAGE_SENT, delayBetweenMessages)
          }
        }
      }
      // **** End *****
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
      // input!.textContent = '';
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

  const resetAudioElements = () => {
    senderTypingSound.current.pause();
    senderTypingSound.current.currentTime = 0

    receiverTypingSound.current.pause();
    receiverTypingSound.current.currentTime = 0

    messageReceivedSound.current.pause();
    messageReceivedSound.current.currentTime = 0

    messageSentSound.current.pause();
    messageSentSound.current.currentTime = 0

    senderTypingSound.current.remove();
    receiverTypingSound.current.remove();
    messageReceivedSound.current.remove();
    messageSentSound.current.remove();

    senderTypingSound.current = new Audio(require('./sounds/typing_sound_whatsapp.mp3'));
    senderTypingSound.current.loop = true;

    messageSentSound.current = new Audio(require('./sounds/sent_sound_whatsapp.mp3'));

    messageReceivedSound.current = new Audio(require('./sounds/message_received.mp3'));

    receiverTypingSound.current = new Audio(require('./sounds/is_writing_whatsapp.mp3'));
    receiverTypingSound.current.loop = true;
  }

  let startRecording = () => {
    videoFrames.current = []
    // setVideoFrames([])
    setDownloadingVideo(true)
    // setWaitingDownload(true)
    resetAudioElements()

    try {
      //start animation
      setRecordedChunks([]);
      simulateAllChat();

      // Set canvas dimensions
      // @ts-ignore
      canvas.width = chatRef.current!.offsetWidth;
      // @ts-ignore
      canvas.height = chatRef.current!.offsetHeight;

      // Capture the stream from the canvas with the desired frame rate
      // @ts-ignore
      canvasStreamRef.current = canvas.captureStream(30); // Specify the frame rate here, e.g., 30 FPS

      // Combine audio and canvas streams
      const combinedStream = new MediaStream([
        // @ts-ignore
        ...canvasStreamRef.current.getVideoTracks(),
        // ...mixedOutput!.stream.getAudioTracks(),
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

      // @ts-ignore
      mediaRecorderRef.current.start();

      // Capture the frame
      // captureFrameFbF(FrameType.SILENT)

    } catch (error) {
      console.log("Error log from startRecording", error);
    }
  }


  function extractTime(stderrLine: string): number | null {
    const match = stderrLine.match(/time=([0-9:.]+)/);
    const time = match ? match[1] : null;
    if (time) {
      return timeToMilliseconds(time)
    }
    return null
  }

  function timeToMilliseconds(time: string): number {
    const parts = time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]); // Utiliser parseFloat pour gérer les secondes et millisecondes

    // Convertir heures, minutes et secondes en millisecondes
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  ffmpeg.on("log", ({type, message}) => {
    console.log("log message", message)
    const parsedMessage = extractTime(message)
    if (parsedMessage && videoDuration) {
      // convert to ms
      setDownloadProgress(Math.round((parsedMessage / videoDuration) * 100))
    }
  })

  ffmpeg.on("progress", ({progress, time}) => {
    // console.log("progress progress", progress)
    console.log("progress time", time)
  })

  const getConsecutiveOccurrences = (list: FrameType[]): { frameType: FrameType, index: number, nbFrames: number }[] => {
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

  const convertFramesToVideo = async () => {
    try {
      // Load the FFmpeg core
      await ffmpeg.load();

      // Initialize a variable to store the concat demuxer file content
      let concatFileContent = '';

      // interactions strats after 1 second,
      let videoTime = 0;
      let filterComplex = '';
      let audioMix: string[] = [];
      const timeAndDuration = getConsecutiveOccurrences(videoFrames.current.map(frame => frame.frameType))

      timeAndDuration.forEach((timeAndDuration, index) => {
        if (timeAndDuration.frameType === FrameType.SILENT) {
          videoTime += timeAndDuration.nbFrames * delayBetweenMessages // TODO change with videoFrame.duration (refacto)
        }
        if (timeAndDuration.frameType === FrameType.CHAR_TYPE) {
          const duration = (timeAndDuration.nbFrames * typingSpeed)
          filterComplex += `;[1:a]aloop=loop=-1:size=2e+09,atrim=duration=${duration / 1000},adelay=${videoTime}|${videoTime},asetpts=N/SR/TB[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        }
        if (timeAndDuration.frameType === FrameType.MESSAGE_SENT) {
          const duration = delayBetweenMessages
          filterComplex += `;[2:a]adelay=${videoTime}|${videoTime}[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        }
        if (timeAndDuration.frameType === FrameType.RECEIVER_TYPING) {
          const duration = delayBetweenMessages
          filterComplex += `;[4:a]adelay=${videoTime}|${videoTime}[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        }
        if (timeAndDuration.frameType === FrameType.MESSAGE_RECEIVED) {
          const duration = delayBetweenMessages
          filterComplex += `;[3:a]adelay=${videoTime}|${videoTime}[aud_${index}]`
          audioMix.push(`[aud_${index}]`)
          videoTime += duration
        }

      })

      // set video duration in ms
      setVideoDuration(videoTime)

      console.log(videoFrames)
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
      const senderTypingSound = await fetchFile(require('./sounds/typing_sound_30s.mp3'));
      let messageSentSound = await fetchFile(require('./sounds/sent_sound_whatsapp.mp3'));
      let messageReceivedSound = await fetchFile(require('./sounds/message_received.mp3'));
      let receiverTypingSound = await fetchFile(require('./sounds/is_writing_whatsapp_original_2s.mp3'));
      await ffmpeg.writeFile('sender_typing_sound.mp3', senderTypingSound);
      await ffmpeg.writeFile('message_sent.mp3', messageSentSound);
      await ffmpeg.writeFile('message_received.mp3', messageReceivedSound);
      await ffmpeg.writeFile('receiver_typing_sound.mp3', receiverTypingSound);

      filterComplex = '[0:v]setpts=PTS-STARTPTS[v]' + filterComplex + `;${audioMix.join('')}amix=inputs=${audioMix.length}[audio_mix]`
      // Execute the FFmpeg command using the concat demuxer to convert the images to a video
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

      console.log("after exec")

      // Read the generated video file from the virtual file system
      const data = await ffmpeg.readFile('out.mp4');

      console.log("after readFile out.mp4")

      // Create a URL for the video file
      const videoURL = URL.createObjectURL(new Blob([data], {type: 'video/mp4'}));
      console.log("videoUrl", videoURL);

      // Use this videoURL to display the video or download it
      downloadRecording(videoURL);
      // downloadWithProgress(videoURL)
    } catch (e) {
      console.log(e)
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
                            resetAudioElements()
                            simulateAllChat()
                          }
                          }>Simulate
                  </button>
                  <button disabled={messages.length === 0 || simulateMessageOn}
                          className="col btn btn-info"
                          onClick={startRecording}>

                    {downloadingVideo &&
                        <span className="spinner-grow spinner-grow-sm mx-2" role="status"
                              aria-hidden="true"/>}
                    Get video
                  </button>
                  <button disabled={messages.length === 0 || simulateMessageOn}
                          className="col btn btn-info"
                          onClick={convertFramesToVideo}>

                    {downloadingVideo &&
                        <span className="spinner-grow spinner-grow-sm mx-2" role="status"
                              aria-hidden="true"/>}
                    Download {downloadProgress}%
                  </button>
                </div>
              </div>
            </div>
            <div className="col">
              <div className={"chat-blurry-container"}>
                <div ref={chatRef} className={`chat-container ${downloadingVideo ? 'blur' : ''}`}>
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
                  <span className={"icon-microphone center-icon"}/>
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
                        <strong>{`Loading ${messages.length}/${messagesSim.length}`}</strong>
                      </div>
                    </div>

                )}
              </div>
              <div className={"generate-buttons"}>
                <button className="btn btn-primary" onClick={() => downloadImage()}
                        disabled={simulateMessageOn}>Download as
                  Image
                </button>

                <button disabled={messages.length === 0 || simulateMessageOn}
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

export default App;
