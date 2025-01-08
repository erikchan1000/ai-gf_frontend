import React from 'react';
import { MdFilledButton } from '@material/web/button/filled-button.js';
import { createComponent } from '@lit/react';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
import { MdCircularProgress } from '@material/web/progress/circular-progress.js';

export const MdFilledButtonReact = createComponent({
  tagName: 'md-filled-button',
  elementClass: MdFilledButton,
  react: React,
  events: {
    onClick: 'click',
  }
}) 

export const MdOutlinedTextFieldReact = createComponent({
  tagName: 'md-outlined-text-field',
  elementClass: MdOutlinedTextField,
  react: React,
  events: {
    onChange: 'change',
    onKeyPress: 'keypress',
  }
})

export const MdCircularProgressReact = createComponent({
  tagName: 'md-circular-progress',
  elementClass: MdCircularProgress, 
  react: React,
  events: {
    onProgress: 'progress',
  }
})
