import React, {useState} from 'react';
import { TextField } from '@mui/material';

interface TextBoxProps {
  handleMessageSend: (message: string) => void;
}

export const TextBox: React.FC<TextBoxProps> = ({handleMessageSend}) => {
  const [inputText, setInputText] = useState<string>('');
  //adjust the height of the text box based on the amount of text

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend(inputText);
      setInputText('');
    }
  }
  
   return (
    <form style={{
        width: '100%'
    }}
    >
      <TextField value={inputText} placeholder="Message"
        variant="outlined"
        sx={{
          borderRadius: '20px',
          width: '100%',
          backgroundColor: 'rgba(128, 82, 106, 0.8)',

          '& .MuiInputBase-input': {
            color: '#ECE6F0',
          },

          '& .MuiInputBase-input::placeholder': {
            opacity: '1 !important',
          },

          '& .MuiInputBase-root': {
            borderRadius: '20px',

            '&.Mui-focused fieldset': {
              borderColor: '#ECE6F0',
            },

            '&:hover fieldset': {
              borderColor: '#ECE6F0',
            }
          },

        }}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        multiline
      />
    </form>
  )
}
