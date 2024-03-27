import {Dispatch, SetStateAction} from "react";
import {MessageStatus} from "../../enums/enums";

export type ReactState<T> = [T, Dispatch<SetStateAction<T>>];

export interface Message {
  received: boolean;
  text?: string;
  imageMessage?: Blob;
  status?: MessageStatus;
  displayTail: boolean;
  messageTime: string;
  messageDate?: string;
}

export interface StorableMessage {
  received: boolean;
  text?: string;
  imageMessage?: string;
  status?: MessageStatus;
  displayTail: boolean;
  messageTime: string;
  messageDate?: string;
}

export interface MessageDisplayed {
  display: boolean;
  index: number;
}

export const MAX_TYPING_DELAY = 150
export const MIN_TYPING_DELAY = 30