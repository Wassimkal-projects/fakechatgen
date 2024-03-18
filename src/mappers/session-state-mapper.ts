import {SessionState, StorableSessionState} from "../utils/indexedDB/indexed-db";
import {getObjectFromURLFileData} from "../utils/file/file-utils";
import {Message, StorableMessage} from "../utils/types/types";

const toStorableMessages = async (messages: Message[]): Promise<StorableMessage[]> => {
  const promises = messages.map(async (message) => {
    // Check if imageMessage exists before trying to fetch the object
    const imageMessageData = await getObjectFromURLFileData(message.imageMessage ?? null);

    return {
      ...message,
      imageMessage: imageMessageData
    } as StorableMessage;
  });

  // Wait for all promises to resolve
  return Promise.all(promises);
}

const toMessages = (storableMessages: StorableMessage[]): Message[] => {
  return storableMessages.map(storableMessage => {
    const imageMessage = storableMessage.imageMessage ? URL.createObjectURL(storableMessage.imageMessage) : null
    return {
      ...storableMessage,
      imageMessage: imageMessage
    } as Message
  })
}

export const toStorableSessionState = async (session: SessionState): Promise<StorableSessionState> => {
  return {
    ...session,
    id: "session-id",
    profilePicture: await getObjectFromURLFileData(session.profilePicture),
    messages: await toStorableMessages(session.messages)
  }
}

export const toSessionState = (storableSession: StorableSessionState): SessionState => {
  const profilePicture = storableSession.profilePicture ? URL.createObjectURL(storableSession.profilePicture) : null
  return {
    ...storableSession,
    profilePicture: profilePicture,
    messages: toMessages(storableSession.messages)
  } as SessionState
}