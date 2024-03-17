import {Message} from "../types/types";

interface SessionState {
  receiversName: string;
  profilePicture: any;
  showHeader: boolean;
  showBatteryPercentage: boolean;
  network: string;
  phoneTime: string;
  messages: Message[]
}

const defaultSession: SessionState = {
  receiversName: 'John Doe',
  messages: [],
  showHeader: true,
  showBatteryPercentage: true,
  phoneTime: '15:08',
  network: '5G',
  profilePicture: require("../../img/avatar.png")
}
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