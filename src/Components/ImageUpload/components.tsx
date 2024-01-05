import React, {useEffect, useState} from 'react';
import {ReactState} from "../../utils/types/types";

export const ImageUpload: React.FC<{
  setImageMessageState: ReactState<string | undefined>
}> = ({setImageMessageState}) => {

  const [inputKey, setInputKey] = useState(Date.now());
  useEffect(() => {
    console.log("I think it's here ?")
    setInputKey(Date.now())
  }, [setImageMessageState])
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file && file.type.substr(0, 5) === 'image') {
      // setImage(file);
      setImageMessageState[1](URL.createObjectURL(file))
    } else {
      // setImage(null);
    }
  };

  return (
      <div>
        <input type="file" accept="image/*"
               onChange={handleImageChange} key={inputKey}/>
      </div>
  );
};