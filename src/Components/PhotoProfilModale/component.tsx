import React from "react";
// @ts-ignore
import AvatarImageCropper from 'react-avatar-image-cropper';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import {ReactState} from "../../utils/types/types";

export const PhotoProfilModale: React.FC<{
  pdpState: ReactState<boolean>,
  setProfilePictureSrcState: ReactState<Blob | null>
}> = ({
        pdpState,
        setProfilePictureSrcState
      }) => {


  const [pdpOpen, setPdpOpen] = pdpState;

  const apply = (file: any) => {
    // let src = window.URL.createObjectURL(file);
    setProfilePictureSrcState[1](file)
    setPdpOpen(false)
  };

  return (

      <Modal
          show={pdpOpen}
          onHide={() => setPdpOpen(false)}
          aria-labelledby="Update PP"
          aria-describedby="Update PP"
      >
        <ModalHeader>
          Add profile picture
        </ModalHeader>
        <ModalBody>
          <AvatarImageCropper className={"avatar-style"} apply={apply}/>
        </ModalBody>
        <ModalFooter>
          <Button className={"btn btn-sm btn-primary"}
                  onClick={() => setPdpOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

  )
}