import React, {useState} from 'react';
import { TextField, FormControl, Input, InputLabel, IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface TextBoxProps {
  handleMessageSend: (message: string) => void;
  activateVoice: () => void;
  activateVoiceState: boolean;
}

export const TextBox: React.FC<TextBoxProps> = ({handleMessageSend, activateVoice, activateVoiceState}) => {
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
      <FormControl 
        variant="outlined"
        sx={{
          borderRadius: '20px',
          width: '100%',
          backgroundColor: '#1e1f20',

          '& .MuiInputBase-input': {
            color: '#ECE6F0',
          },

          '& .MuiInputBase-input::placeholder': {
            opacity: '1 !important',
          },

          '& .MuiInputBase-root': {
            borderRadius: '20px',
            paddingTop: '1.25rem',
            paddingBottom: '1.25rem',

            '&.Mui-focused fieldset': {
              borderColor: '#ECE6F0',
            },

            '&:hover fieldset': {
              borderColor: '#ECE6F0',
            }
          },

        }}
      >
        <Input
          id="message"
          multiline
          rows={1}
          value={inputText}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          sx={{
            color: '#ECE6F0',
            fontSize: '1rem',
            borderRadius: '20px',
            borderColor: '#ECE6F0',
            padding: '1.25rem',

            '& .MuiInputBase-input::placeholder': {
              opacity: '0.8 !important',
            }
          }}
          disableUnderline

          endAdornment={
            <IconButton onClick={() => activateVoice()}
              sx={{
                color: '#ECE6F0',
                padding: '0px',
                marginRight: '10px',
              }}
            >
              <VolumeUpIcon
                sx={{
                  color: `${activateVoiceState ? 'green' : 'red'}`,
                  width: '25px',
                  height: '100%',
                }}
              />
            </IconButton>
          }
        />
      </FormControl>
  )
}
