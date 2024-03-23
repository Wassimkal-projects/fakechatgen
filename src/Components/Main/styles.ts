import styled, {css} from "styled-components";
import backgroundImg from "../../img/whatsapp_bg_light.jpg"

const videoDimentions = (videoFormat: string): { width: string; height: string } => {
  switch (videoFormat) {
    case 'VERTICAL':
      return {width: '346', height: '650'}
    case 'SQUARE':
      return {width: '346', height: '346'}
    default:
      return {width: '346', height: '650'}
  }
}

export const ChatContainer = styled.div<{
  $videoformat: string,
  $blur: boolean
}>`${props =>
    css`
      height: ${videoDimentions(props.$videoformat).height}px;
      min-width: ${videoDimentions(props.$videoformat).width}px;
      max-width: ${videoDimentions(props.$videoformat).width}px;
      margin: auto;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background-image: url(${backgroundImg});`
}

`