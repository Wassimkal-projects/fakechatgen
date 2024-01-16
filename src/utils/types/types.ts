import {Dispatch, SetStateAction} from "react";
import {MessageStatus} from "../../enums/enums";

export type ReactState<T> = [T, Dispatch<SetStateAction<T>>];

export interface Message {
  received: boolean;
  text?: string;
  imageMessage?: string;
  status?: MessageStatus;
  displayTail: boolean;
  messageTime: string;
}

export interface MessageDisplayed {
  display: boolean;
  index: number;
}
