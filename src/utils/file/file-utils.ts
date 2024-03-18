export const getObjectFromURLFileData = async (objectURL: string | null) => {
  if (!objectURL) return null;
  try {
    const response = await fetch(objectURL);
    return await response.blob();

    // Optionally, convert the Blob to a File
    // return new File([blob], "filename", {type: blob.type}); // or return blob if you only need the Blob
  } catch (error) {
    console.error('Error fetching object URL data:', error);
    return null;
  }
}

//TODO compress file
