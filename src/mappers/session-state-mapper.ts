import {SessionState, StorableSessionState} from "../utils/indexedDB/indexed-db";
import {Message, StorableMessage} from "../utils/types/types";


const toStorableMessages = async (messages: Message[]): Promise<StorableMessage[]> => {
  const promises = messages.map(async (message) => {
    // Check if imageMessage exists before trying to fetch the object

    return {
      ...message,
      imageMessage: message.imageMessage ? await toBase64(message.imageMessage) : ''
    } as StorableMessage;
  });

  // Wait for all promises to resolve
  return Promise.all(promises);
}

const toMessages = (storableMessages: StorableMessage[]): Message[] => {
  return storableMessages.map(storableMessage => {
    // const imageMessage = storableMessage.imageMessage ? URL.createObjectURL(storableMessage.imageMessage) : null
    return {
      ...storableMessage,
      imageMessage: storableMessage.imageMessage ? base64ToBlob(storableMessage.imageMessage) : null
    } as Message
  })
}

export const toStorableSessionState = async (session: SessionState): Promise<StorableSessionState> => {
  return {
    ...session,
    id: "session-id",
    profilePicture: session.profilePicture ? await toBase64(session.profilePicture) : '',
    messages: await toStorableMessages(session.messages)
  }
}

export const toSessionState = (storableSession: StorableSessionState): SessionState => {
  // const profilePicture = storableSession.profilePicture ? URL.createObjectURL(storableSession.profilePicture) : null
  return {
    ...storableSession,
    profilePicture: storableSession.profilePicture ? base64ToBlob(storableSession.profilePicture) : null,
    messages: toMessages(storableSession.messages)
  } as SessionState
}

const toBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
}

const base64ToBlob = (base64: string, contentType: string = 'image/jpeg', sliceSize: number = 512): Blob | null => {
  try {
    const byteCharacters = atob(base64); // Decode base64 string
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType}); // Create blob
    return blob;
  } catch (error) {
    return null
  }
}
