'use client'

import React from 'react';
import './style.scss';

interface IntroductionProps {
  display: boolean;
}

const Introduction: React.FC<IntroductionProps> = ({display}) => {
  return (
    <div
      style={{
        display: display ? 'block' : 'none',
      }}
    >

      <div className="reveal-mask">
        <span
          className="introduction-header"
        >Welcome to Nia</span>

      </div>
      <h2 className="subheader-2"> 
        Neural Interactive Assistant
      </h2>
    </div>
  );
}

export default Introduction;
