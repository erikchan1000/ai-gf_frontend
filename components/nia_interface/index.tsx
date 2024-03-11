'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { TextBox } from '@/components/textbox';
import { sendGeminiMessage, readGeminiMessage } from '@/utils/sendGeminiMessage'; 
import { MessageHistoryProps, ContentProps } from '@/components/nia_interface/interface';
import { MessageHistory } from '@/components/message_history';
import { sendElevenLabsMessage } from '@/utils/sendElevenLabsMessage';

const NiaInterface = () => {
  const [response, setResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<MessageHistoryProps>({contents: []});
  const [error, setError] = useState<boolean>(false);
  const audioPlayer = useRef<HTMLAudioElement | null>(null); 

  //use indexing 0 in parts to retrieve message, subsequent indexes are for context and prompting
  const updateChatHistory = useCallback((message: string, role: "user" | "model") => {
    const newMessage: ContentProps = {
      role: role,
      parts: [{ text: message }],
    };
    setChatHistory({contents: [...chatHistory.contents, newMessage]});
  }
  , [chatHistory]);

  const playAudio = useCallback(async (audio: Buffer) => {
    if (!audioPlayer) {
      console.error("Audio player not found");
      return;
    }

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength);
      const audioData = await audioContext.decodeAudioData(arrayBuffer);
      console.log("Audio Data: ", audioData)
      const source = audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(audioContext.destination);
      source.start();
    }
    catch (error) {
      console.error("Error playing audio: ", error);
    }
  }, [audioPlayer]) 

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
        console.log("Value: ", value)
        newResponse += value;
        setChatHistory({contents: [...chatHistory.contents, newMessage, {role: "model", parts: [{text: newResponse}]}]});
        setError(false);
        const audio = await sendElevenLabsMessage(value) as Buffer;
        playAudio(audio);
      }

      console.log("Stream Status: ", stream.locked);

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
  }, [chatHistory, updateChatHistory, playAudio]);

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
      <audio ref={audioPlayer} />
    </Box>
  )
}

export default NiaInterface;
