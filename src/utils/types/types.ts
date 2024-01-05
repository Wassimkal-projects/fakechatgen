import {Dispatch, SetStateAction} from "react";

export type ReactState<T> = [T, Dispatch<SetStateAction<T>>];

export interface Message {
  received: boolean;
  message?: string;
  imageMessage?: string;
}

export interface MessageDisplayed {
  display: boolean;
  index: number;
}