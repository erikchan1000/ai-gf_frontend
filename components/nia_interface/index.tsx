'use client';

import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { TextBox } from '@/components/textbox';
import { sendGeminiMessage, readGeminiMessage } from '@/utils/sendGeminiMessage'; 
import { MessageHistoryProps, ContentProps } from '@/components/nia_interface/interface';
import { MessageHistory } from '@/components/message_history';

const NiaInterface = () => {
  const [response, setResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<MessageHistoryProps>({contents: []});
  const [error, setError] = useState<boolean>(false);
  
  //use indexing 0 in parts to retrieve message, subsequent indexes are for context and prompting
  const updateChatHistory = useCallback((message: string, role: "user" | "model") => {
    const newMessage: ContentProps = {
      role: role,
      parts: [{ text: message }],
    };
    setChatHistory({contents: [...chatHistory.contents, newMessage]});
  }
  , [chatHistory]);

  const sendMessage = useCallback(async (message: string) => {
    updateChatHistory(message, "user");
    try {
      const stream = await sendGeminiMessage(chatHistory, message);
      const reader = readGeminiMessage(stream);
      let newResponse = '';

      const newMessage: ContentProps = {
        role: "user",
        parts: [{ text: message}],
      };
      
      for await( const value of reader ) {
        console.log("Prev:", chatHistory)
        newResponse += value;
        setChatHistory({contents: [...chatHistory.contents, newMessage, {role: "model", parts: [{text: newResponse}]}]});
        setError(false);
      }
      const updatedResponse: ContentProps = {
        role: "model",
        parts: [{ text: newResponse }],
      };

      setChatHistory({contents: [...chatHistory.contents, newMessage, updatedResponse]});
    }
    catch (error) {
      console.error("Error sending Gemini Message: ", error);
      setResponse("Error sending message, try again later.");
      setError(true);
    }
  }, [chatHistory, updateChatHistory]);

  console.log(chatHistory);
  
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
        overflow="scroll"
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
        <MessageHistory contents={chatHistory.contents}/>
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
