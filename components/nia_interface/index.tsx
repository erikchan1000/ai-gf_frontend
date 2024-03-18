'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { TextBox } from '@/components/textbox';
import { sendGeminiMessage, readGeminiMessage } from '@/utils/sendGeminiMessage';
import { MessageHistoryProps, ContentProps } from '@/components/nia_interface/interface';
import { MessageHistory } from '@/components/message_history';
import { sendElevenLabsMessage, readElevenLabsMessage, createSocket } from '@/utils/sendElevenLabsMessage';
import Aud from './test.json';
import { StreamPlayer, StreamPlayerType } from '@/utils/audio_queue';

const NiaInterface = () => {
  const [response, setResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<MessageHistoryProps>({ contents: [] });
  const [error, setError] = useState<boolean>(false);
  let streamPlayer: StreamPlayerType;
  
  //use indexing 0 in parts to retrieve message, subsequent indexes are for context and prompting
  const updateChatHistory = useCallback((message: string, role: "user" | "model") => {
    const newMessage: ContentProps = {
      role: role,
      parts: [{ text: message }],
    };
    setChatHistory({ contents: [...chatHistory.contents, newMessage] });
  }
    , [chatHistory]);

  const sendMessage = useCallback(async (message: string) => {
    streamPlayer = new StreamPlayer();
    updateChatHistory(message, "user");
    try {
      const stream = await sendGeminiMessage(chatHistory, message);
      const tee = stream.tee();
      const reader = readGeminiMessage(tee[0]);
      let newResponse = '';
      const socket: WebSocket = createSocket();

      const newMessage: ContentProps = {
        role: "user",
        parts: [{ text: message }],
      };

      const audioStream = await sendElevenLabsMessage(tee[1],socket); 
      const audioReader = readElevenLabsMessage(audioStream);

      const textPromise = (async () => {
        for await (const response of reader) {
          console.log("CHATHISTORY: ", chatHistory);
          newResponse += response;
          setChatHistory({
            contents: [...chatHistory.contents, {role:"user", parts:[{text: message}]}, { role: "model", parts: [{ text: newResponse}] }],
          })
          setError(false);
        }
      })();

      const audioPromise = (async () => {
        for await (const audio of audioReader) {
          console.log("Playing Audio")
          //streamPlayer.playAudioChunk(audio);
          streamPlayer.addBufferArray(audio);
        }
      })();

      await Promise.all([textPromise, audioPromise]);

      streamPlayer.playBufferArray();

      const updatedResponse: ContentProps = {
        role: "model",
        parts: [{ text: newResponse }],
      };

      setChatHistory({ contents: [...chatHistory.contents, newMessage, updatedResponse] });

    }
    catch (error) {
      console.error("Error sending Gemini Message: ", error);
      setResponse("Error sending message, try again later.");
      setError(true);
    }
  }, [chatHistory, updateChatHistory]);

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
        <MessageHistory contents={chatHistory.contents} />
      </Box>
      <Box
        sx={{
          width: '80%',
          position: 'relative',
        }}
      >
        <TextBox handleMessageSend={sendMessage} />
      </Box>
    </Box>
  )
}

export default NiaInterface;
