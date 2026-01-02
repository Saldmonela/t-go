
import React from 'react';

export const AngkotIcon: React.FC<{ className?: string; color?: string }> = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 15C3 13.8954 3.89543 13 5 13H19C20.1046 13 21 13.8954 21 15V18C21 19.1046 20.1046 20 19 20H18C18 21.1046 17.1046 22 16 22C14.8954 22 14 21.1046 14 20H10C10 21.1046 9.10457 22 8 22C6.89543 22 6 21.1046 6 20H5C3.89543 20 3 19.1046 3 18V15Z" fill={color}/>
    <path d="M4 13L6 6H18L20 13H4Z" fill={color} opacity="0.3"/>
    <rect x="7" y="15" width="2" height="2" rx="0.5" fill="white"/>
    <rect x="15" y="15" width="2" height="2" rx="0.5" fill="white"/>
    <path d="M8 20C8.55228 20 9 19.5523 9 19C9 18.4477 8.55228 18 8 18C7.44772 18 7 18.4477 7 19C7 19.5523 7.44772 20 8 20Z" fill="white"/>
    <path d="M16 20C16.5523 20 17 19.5523 17 19C17 18.4477 16.5523 18 16 18C15.4477 18 15 18.4477 15 19C15 19.5523 15.4477 20 16 20Z" fill="white"/>
  </svg>
);
