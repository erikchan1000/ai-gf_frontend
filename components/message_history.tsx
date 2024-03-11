import React from 'react';
import { MessageHistoryProps } from '@/components/nia_interface/interface';

export const MessageHistory = (props: MessageHistoryProps) => {
  return (
    <div>
      {props.contents.map((content, index) => {
        return (
          <div key={index}>
            <p>{(content.role == "model" ? "Nia" : "User") + ": "}{content.parts[0].text}</p>
          </div>
        );
      })}
    </div>
  );
};
