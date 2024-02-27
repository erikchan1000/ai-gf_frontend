'use client';

import React, { useState, useCallback } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { TextBox } from '@/components/textbox';
import { sendGeminiMessage, readGeminiMessage } from '@/utils/sendGeminiMessage'; 

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    background: '#f4f4f4',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
  '& .sendButton': {
    position: 'absolute',
    right: '0px',
    top: '0px',
    height: '100%',
    borderTopRightRadius: '20px',
    borderBottomRightRadius: '20px',
    zIndex: 1,
  },
});



const NiaInterface = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState({contents: []});
  
  const sendMessage = async (message: string) => {
    const stream = await sendGeminiMessage(chatHistory, message);
    const reader = readGeminiMessage(stream);
    let response = '';
    for await( const value of reader ) {
      response += value; 
      setResponse(response);
    }
  }
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        padding: '0px',
        width: '100%',
      }}
    >
      <Typography variant="h5">Nia Interface</Typography>
      <Box
        flex="1"
        overflow="auto"
        sx={{
          border: '1px solid gray',
          borderRadius: '20px',
          width: '100%',
          padding: '10px',
          margin: '10px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message, index) => (
          <Typography key={index}>{message}</Typography>
        ))}
        <Typography>{response}</Typography>
      </Box>
      <Box
        sx={{
          width: '80%',
          position: 'relative',
        }}
      >
        <TextBox handleMessageSend={sendMessage}/>
      </Box>
    </Box>
  )
}

export default NiaInterface;
