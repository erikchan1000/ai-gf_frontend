import React from 'react';
import { NewMessageProps } from '@/components/nia_interface/interface';
import Image from 'next/image';
import NeilPicture from '@/public/neil.jpg';
import LinearProgress from '@mui/material/LinearProgress';
import NiaPicture from '@/public/Nia.png';
import Markdown from 'react-markdown';
import './message_history.scss'

export const MessageHistory = (props: NewMessageProps) => {
  const regex = /\bError[^\n.]*[.?!]/g;
  return (
    <div>
      {props.contents.map((content, index) => {
        const errors = content.parts[0].text.match(regex);
        const message = content.parts[0].text.replace(regex, '');

        return (
          <div key={index}
            style={{
              marginTop: `${index > 0 ? '20px' : '0px'}`,
            }}
          >
            {content.role == "user" ? <Image src={NeilPicture} alt="Neil" 
              style={{
                borderRadius: '100%',
                height: '40px',
                width: '40px',
                objectFit: 'cover',
              }}
              loading="eager"
            /> : 
            <div className="h-[40px] w-[40px]"> 
              <Image src={NiaPicture} alt="Nia" 
                style={{
                  borderRadius: '100%',
                  height: '40px',
                  width: '40px',
                  objectFit: 'cover',
                }}
                loading="eager"
              />
            </div>
            }
            <div
              style={{
                color: 'white',
                marginLeft: '40px',
                opacity: 0.8,
              }}
            >
              <Markdown>
                {message}
              </Markdown>
            </div>
            {errors && errors.length > 0 ?
              <strong
                style={{
                  color: 'red',
                  marginLeft: '40px',
                  opacity: 0.8,
                }}
                >
                {errors[0]}
              </strong> : ''
            }
            {props.loading && index === props.contents.length - 1 ? 
              <LinearProgress
               sx={{
                  color: '#99327e',
                  marginLeft: '10px',
                  marginRight: '10px',
                  marginTop: '20px',
                  borderRadius: '30px',
                }}
              /> : ''}
          </div>
        );
      })}
    </div>
  );
};
