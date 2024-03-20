import {Message} from "../types/types";

interface SessionState {
  receiversName: string;
  profilePicture: string;
  showHeader: boolean;
  showBatteryPercentage: boolean;
  network: string;
  phoneTime: string;
  messages: Message[]
}

export const defaultSession: SessionState = {
  receiversName: 'John Doe',
  messages: [],
  showHeader: true,
  showBatteryPercentage: true,
  phoneTime: '15:08',
  network: '5G',
  profilePicture: "../../img/avatar.png"
}


export const emptySession: SessionState = {
  receiversName: '',
  messages: [],
  showHeader: true,
  showBatteryPercentage: true,
  phoneTime: '',
  network: '5G',
  profilePicture: ''
} as SessionState

export const saveSession = (sessionState: SessionState) => {
  localStorage.setItem('sessionState', JSON.stringify(sessionState))
}

export const loadSession = (): SessionState => {
  const session = localStorage.getItem('sessionState')
  if (session) {
    return JSON.parse(session);
  }
  return defaultSession;
}