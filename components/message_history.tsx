import React from 'react';
import { MessageHistoryProps } from '@/components/nia_interface/interface';
import Image from 'next/image';
import NeilPicture from '@/public/neil.jpg';
import CloudIcon from '@mui/icons-material/Cloud';
import NiaPicture from '@/public/Nia.png';

export const MessageHistory = (props: MessageHistoryProps) => {
  const regex = /\bError[^\n.]*[.?!]/g;
  return (
    <div>
      {props.contents.map((content, index) => {
        const errors = content.parts[0].text.match(regex);
        console.log("error", errors)
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
            <p
              style={{
                color: 'white',
                marginLeft: '40px',
                opacity: 0.8,
              }}
            >{message}</p>
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
          </div>
        );
      })}
    </div>
  );
};
