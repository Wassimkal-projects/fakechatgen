import styled from "styled-components"

/*export const MessageDiv2 = styled.div<{ isreceived: boolean, isdisplaytail: boolean }>`
  margin: ${({isreceived, isdisplaytail}) => {
  if (isreceived) {
    return isdisplaytail ? '0 0 5px 0 !important' : '0 0 5px 8px !important';
  } else {
    return isdisplaytail ? '0 0 5px auto !important' : '0 7px 5px auto !important';
  }
}};
  padding: 4px 5px 6px 7px;
  border-radius: ${({isreceived, isdisplaytail}) => {
  if (isreceived) {
    return isdisplaytail ? '0 10px 10px 10px' : '10px 10px 10px 10px';
  } else {
    return isdisplaytail ? '10px 0 10px 10px' : '10px 10px 10px 10px';
  }
}};
  background: ${({isreceived}) => (isreceived ? '#ffffff !important' : '#e6ffda !important')};
  box-shadow: 0 1px 1px rgb(0 0 0 / 13%);
  position: relative;
`;*/


export const MessageDiv = styled.div<{ $isreceived: boolean, $isdisplaytail: boolean }>`
  margin: ${({$isreceived, $isdisplaytail}) => {
  if ($isreceived) {
    return $isdisplaytail ? '0 0 5px 0 !important' : '0 0 5px 8px !important';
  } else {
    return $isdisplaytail ? '0 0 5px auto !important' : '0 7px 5px auto !important';
  }
}};
  padding: 4px 5px 6px 7px;
  border-radius: ${({$isreceived, $isdisplaytail}) => {
  if ($isreceived) {
    return $isdisplaytail ? '0 10px 10px 10px' : '10px 10px 10px 10px';
  } else {
    return $isdisplaytail ? '10px 0 10px 10px' : '10px 10px 10px 10px';
  }
}};
  background: ${({$isreceived}) => ($isreceived ? '#ffffff !important' : '#e6ffda !important')};
  box-shadow: 0 1px 1px rgb(0 0 0 / 13%);
  position: relative;
`;