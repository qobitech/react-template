import { FC } from 'react'

interface ISVGComponent extends React.SVGProps<SVGSVGElement> {
  color?: string
}

export const TrashSVG: FC<ISVGComponent> = ({ color, ...rest }) => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M17.7351 5.07178L17.0431 21.6796C17.0212 22.2067 16.5657 22.6425 16.0365 22.6425H3.96107C3.43186 22.6425 2.97637 22.2058 2.95444 21.6796L2.26245 5.07178C2.24944 4.75944 1.98568 4.51678 1.67334 4.5298C1.361 4.54281 1.11835 4.80657 1.13136 5.11891L1.82335 21.7267C1.87055 22.8594 2.82507 23.7746 3.96107 23.7746H16.0365C17.1719 23.7746 18.127 22.8609 18.1742 21.7267L18.8662 5.11891C18.8792 4.80657 18.6366 4.54281 18.3242 4.5298C18.0119 4.51678 17.7481 4.75944 17.7351 5.07178Z"
        fill={color || 'black'}
      />
      <path
        d="M9.62305 7.35901V20.1892C9.62305 20.5018 9.87647 20.7552 10.1891 20.7552C10.5017 20.7552 10.7551 20.5018 10.7551 20.1892V7.35901C10.7551 7.04639 10.5017 6.79297 10.1891 6.79297C9.87647 6.79297 9.62305 7.04639 9.62305 7.35901Z"
        fill={color || 'black'}
      />
      <path
        d="M5.28345 7.37565L5.66081 20.2058C5.67 20.5183 5.93077 20.7642 6.24324 20.755C6.55572 20.7458 6.80159 20.485 6.7924 20.1726L6.41504 7.34237C6.40585 7.02989 6.14508 6.78403 5.8326 6.79322C5.52013 6.80241 5.27426 7.06317 5.28345 7.37565Z"
        fill={color || 'black'}
      />
      <path
        d="M13.5846 7.34237L13.2073 20.1726C13.1981 20.485 13.444 20.7458 13.7564 20.755C14.0689 20.7642 14.3297 20.5183 14.3389 20.2058L14.7162 7.37565C14.7254 7.06317 14.4796 6.80241 14.1671 6.79322C13.8546 6.78403 13.5938 7.02989 13.5846 7.34237Z"
        fill={color || 'black'}
      />
      <path
        d="M0.566038 3.20825H19.434C19.7466 3.20825 20 2.95482 20 2.64221C20 2.3296 19.7466 2.07617 19.434 2.07617H0.566038C0.253424 2.07617 0 2.3296 0 2.64221C0 2.95482 0.253424 3.20825 0.566038 3.20825Z"
        fill={color || 'black'}
      />
      <path
        d="M6.75228 2.66305L7.15615 1.65337C7.26367 1.38458 7.63668 1.13208 7.92484 1.13208H12.0758C12.366 1.13208 12.7362 1.38271 12.8445 1.65337L13.2483 2.66305L14.2994 2.24261L13.8956 1.23293C13.6154 0.532464 12.8289 0 12.0758 0H7.92484C7.17381 0 6.3845 0.534297 6.10504 1.23293L5.70117 2.24261L6.75228 2.66305Z"
        fill={color || 'black'}
      />
    </svg>
  )
}

export const EditSVG: FC<ISVGComponent> = ({ color, ...rest }) => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M1.05614 11.9993H1.10168L3.0399 11.9153C3.30387 11.9047 3.55361 11.793 3.74145 11.6072L11.6905 3.65802C11.8911 3.45736 12 3.19339 12 2.91091C12 2.62843 11.8904 2.36233 11.6905 2.1638L9.83625 0.30951C9.6356 0.108853 9.37163 0 9.08916 0C8.80669 0 8.54059 0.109574 8.34207 0.30951L0.393022 8.25801C0.205192 8.44584 0.0963235 8.69488 0.0849394 8.95958L0.000980964 10.8978C-0.0118261 11.1931 0.101303 11.4827 0.309063 11.6905C0.507566 11.889 0.777234 12 1.05615 12L1.05614 11.9993ZM8.8571 0.822726C8.919 0.760824 9.00083 0.725959 9.08834 0.725959C9.17585 0.725959 9.25768 0.760824 9.31957 0.822726L11.1738 2.67702C11.2357 2.73892 11.2706 2.82075 11.2706 2.90826C11.2706 2.99578 11.2357 3.0776 11.1738 3.1395L10.5036 3.80976L8.18486 1.49098L8.8551 0.820723L8.8571 0.822726ZM7.67173 2.00813L9.99045 4.3269L3.29294 11.0246L0.974214 8.7058L7.67173 2.00813ZM0.787878 9.54952L2.45067 11.2124L1.07035 11.2721C0.979277 11.2757 0.890339 11.2429 0.824162 11.1754C0.758702 11.1099 0.723839 11.0224 0.727396 10.9292L0.787162 9.5488L0.787878 9.54952Z"
        fill={color || 'black'}
      />
    </svg>
  )
}

export const CheckSVG: FC<ISVGComponent> = ({ color, ...rest }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={'12'}
      height={'12'}
      viewBox="0 0 29 29"
      fill="none"
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.74 14.37C28.74 18.1812 27.226 21.8362 24.5311 24.5311C21.8362 27.226 18.1812 28.74 14.37 28.74C10.5588 28.74 6.90377 27.226 4.20888 24.5311C1.51398 21.8362 0 18.1812 0 14.37C0 10.5588 1.51398 6.90377 4.20888 4.20888C6.90377 1.51398 10.5588 0 14.37 0C18.1812 0 21.8362 1.51398 24.5311 4.20888C27.226 6.90377 28.74 10.5588 28.74 14.37ZM21.6089 8.92736C21.4806 8.7995 21.3278 8.69883 21.1597 8.63137C20.9916 8.5639 20.8116 8.53103 20.6305 8.53472C20.4494 8.53841 20.2709 8.57858 20.1057 8.65284C19.9405 8.72709 19.7919 8.8339 19.6689 8.96688L13.4306 16.9153L9.67101 13.1539C9.41563 12.916 9.07785 12.7864 8.72884 12.7926C8.37982 12.7987 8.04682 12.9401 7.8 13.187C7.55317 13.4338 7.41178 13.7668 7.40562 14.1158C7.39947 14.4648 7.52902 14.8026 7.76698 15.058L12.5199 19.8126C12.6479 19.9404 12.8004 20.0412 12.9682 20.1088C13.136 20.1764 13.3157 20.2095 13.4966 20.2061C13.6774 20.2028 13.8558 20.163 14.021 20.0892C14.1862 20.0155 14.3348 19.9092 14.458 19.7767L21.6286 10.8134C21.8731 10.5593 22.0082 10.2194 22.0048 9.86673C22.0014 9.51409 21.8599 9.17683 21.6107 8.92736H21.6089Z"
        fill={color || 'black'}
      />
    </svg>
  )
}

export const CloseSVG: FC<ISVGComponent> = ({ color, ...rest }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={'9'}
      height={'9'}
      viewBox="0 0 6 6"
      fill="none"
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.125881 0.125881C0.165683 0.0859786 0.212966 0.0543201 0.265022 0.0327193C0.317078 0.0111185 0.372884 0 0.429244 0C0.485604 0 0.54141 0.0111185 0.593466 0.0327193C0.645521 0.0543201 0.692805 0.0859786 0.732606 0.125881L3.00011 2.39424L5.26762 0.125881C5.30746 0.0860432 5.35475 0.0544418 5.4068 0.0328815C5.45885 0.0113213 5.51464 0.000224337 5.57098 0.000224337C5.62732 0.000224337 5.68311 0.0113213 5.73516 0.0328815C5.78721 0.0544418 5.83451 0.0860432 5.87434 0.125881C5.91418 0.165719 5.94578 0.213014 5.96734 0.265065C5.9889 0.317116 6 0.372904 6 0.429244C6 0.485583 5.9889 0.541372 5.96734 0.593423C5.94578 0.645474 5.91418 0.692768 5.87434 0.732606L3.60598 3.00011L5.87434 5.26762C5.91418 5.30746 5.94578 5.35475 5.96734 5.4068C5.9889 5.45885 6 5.51464 6 5.57098C6 5.62732 5.9889 5.68311 5.96734 5.73516C5.94578 5.78721 5.91418 5.83451 5.87434 5.87434C5.83451 5.91418 5.78721 5.94578 5.73516 5.96734C5.68311 5.9889 5.62732 6 5.57098 6C5.51464 6 5.45885 5.9889 5.4068 5.96734C5.35475 5.94578 5.30746 5.91418 5.26762 5.87434L3.00011 3.60598L0.732606 5.87434C0.692768 5.91418 0.645474 5.94578 0.593423 5.96734C0.541372 5.9889 0.485583 6 0.429244 6C0.372904 6 0.317116 5.9889 0.265065 5.96734C0.213014 5.94578 0.165719 5.91418 0.125881 5.87434C0.0860432 5.83451 0.0544418 5.78721 0.0328815 5.73516C0.0113213 5.68311 0.000224337 5.62732 0.000224337 5.57098C0.000224337 5.51464 0.0113213 5.45885 0.0328815 5.4068C0.0544418 5.35475 0.0860432 5.30746 0.125881 5.26762L2.39424 3.00011L0.125881 0.732606C0.0859786 0.692805 0.0543201 0.645521 0.0327193 0.593466C0.0111185 0.54141 0 0.485604 0 0.429244C0 0.372884 0.0111185 0.317078 0.0327193 0.265022C0.0543201 0.212966 0.0859786 0.165683 0.125881 0.125881Z"
        fill={color || '#F56E9D'}
      />
    </svg>
  )
}

export const DraggableSVG: FC<ISVGComponent> = ({ color, ...rest }) => {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.39977 8.75015C2.39977 9.43748 1.85974 10 1.19988 10C0.540035 10 0 9.43748 0 8.75015C0 8.06282 0.540035 7.5003 1.19988 7.5003C1.85974 7.5003 2.39977 8.06282 2.39977 8.75015ZM1.19988 3.75015C0.540035 3.75015 0 4.31267 0 5C0 5.68733 0.540035 6.24985 1.19988 6.24985C1.85974 6.24985 2.39977 5.68733 2.39977 5C2.39977 4.31267 1.85974 3.75015 1.19988 3.75015ZM1.19988 0C0.540035 0 0 0.562523 0 1.24985C0 1.93718 0.540035 2.4997 1.19988 2.4997C1.85974 2.4997 2.39977 1.93718 2.39977 1.24985C2.39977 0.562523 1.85974 0 1.19988 0ZM4.80012 2.4997C5.45997 2.4997 6 1.93718 6 1.24985C6 0.562523 5.45997 0 4.80012 0C4.14027 0 3.60023 0.562523 3.60023 1.24985C3.60023 1.93718 4.14027 2.4997 4.80012 2.4997ZM4.80012 3.75014C4.14027 3.75014 3.60023 4.31266 3.60023 4.99999C3.60023 5.68731 4.14027 6.24984 4.80012 6.24984C5.45997 6.24984 6 5.68731 6 4.99999C6 4.31266 5.45997 3.75014 4.80012 3.75014ZM4.80012 7.50028C4.14027 7.50028 3.60023 8.06281 3.60023 8.75014C3.60023 9.43746 4.14027 9.99999 4.80012 9.99999C5.45997 9.99999 6 9.43746 6 8.75014C6 8.06281 5.45997 7.50028 4.80012 7.50028Z"
        fill="black"
      />
    </svg>
  )
}
