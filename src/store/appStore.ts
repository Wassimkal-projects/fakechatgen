import {makeAutoObservable} from "mobx";
import {Message} from "../utils/types/types";

class AppStore {
  time: string = '15:20';
  showPercentageChecked: boolean = true;
  showHeaderChecked: boolean = true;
  network: string = '5G';
  receiverName: string = 'John Doe'
  videoFormat: string = 'VERTICAL'
  typingSpeed: number = 90

  messages: Message[] = []

  downloadingVideo: boolean = false;
  simulateMessageOn: boolean = false;
  encodingOnProgress: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setTime = (time: string) => {
    this.time = time
  }

  setShowPercentageChecked = (value: boolean) => {
    this.showPercentageChecked = value
  }

  setShowHeaderChecked = (value: boolean) => {
    this.showHeaderChecked = value
  }

  setReceiverName = (name: string) => {
    this.receiverName = name
  }

  setNetwork = (network: string) => {
    this.network = network
  }

  setVideoFormat = (value: string) => {
    this.videoFormat = value
  }

  setEncodingOnProgress = (value: boolean) => {
    this.encodingOnProgress = value
  }
  setDownloadingVideo = (value: boolean) => {
    this.downloadingVideo = value
  }
  setSimulateMessageOn = (value: boolean) => {
    this.simulateMessageOn = value
  }

  setMessages = (update: Message[] | ((current: Message[]) => Message[])): void => {
    if (typeof update === 'function') {
      this.messages = update(this.messages)
    } else {
      this.messages = update
    }
  }

  setTypingSpeed = (value: number) => {
    this.typingSpeed = value
  }
}

export const appStore = new AppStore()