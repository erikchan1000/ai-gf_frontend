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
        <h1
          className="introduction-header"
        >Hello, Neil</h1>
      </div>
      <h1 className="subheader">Welcome to Nia</h1>
    </div>
  );
}

export default Introduction;
