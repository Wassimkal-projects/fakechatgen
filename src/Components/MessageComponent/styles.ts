import styled from "styled-components"

export const MessageDiv = styled.div<{ isReceived: boolean, displayTail: boolean }>`
  margin: ${({isReceived, displayTail}) => {
  if (isReceived) {
    return displayTail ? '0 0 5px 0 !important' : '0 0 5px 8px !important';
  } else {
    return displayTail ? '0 0 5px auto !important' : '0 7px 5px auto !important';
  }
}};
  padding: 4px 5px 6px 7px;
  border-radius: ${({isReceived, displayTail}) => {
  if (isReceived) {
    return displayTail ? '0 10px 10px 10px' : '10px 10px 10px 10px';
  } else {
    return displayTail ? '10px 0 10px 10px' : '10px 10px 10px 10px';
  }
}};
  background: ${({isReceived}) => (isReceived ? '#ffffff !important' : '#e6ffda !important')};
  box-shadow: 0 1px 1px rgb(0 0 0 / 13%);
  position: relative;
`;