'use client';

import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { TextBox } from '@/components/textbox';
import { sendGeminiMessage, readGeminiMessage } from '@/utils/sendGeminiMessage';
import { MessageHistoryProps, ContentProps } from '@/components/nia_interface/interface';
import { MessageHistory } from '@/components/message_history';
import { sendElevenLabsMessage, readElevenLabsMessage, createSocket } from '@/utils/sendElevenLabsMessage';
import { StreamPlayer, StreamPlayerType } from '@/utils/audio_queue';

const NiaInterface = () => {
  const [response, setResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<MessageHistoryProps>({ contents: [] });
  const [error, setError] = useState<boolean>(false);
  const [activateVoice, setActivateVoice] = useState<boolean>(false);
  let streamPlayer: StreamPlayerType | null = null;
  
  console.log(activateVoice)

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
    if (!streamPlayer) {
      streamPlayer = new StreamPlayer();
    }

    updateChatHistory(message, "user");
    try {
      const stream = await sendGeminiMessage(chatHistory, message);
      const tee = stream.tee();
      const reader = readGeminiMessage(tee[0]);
      let newResponse = '';
      let audioPromise: Promise<void> | null = null;
      const socket: WebSocket = createSocket();

      const newMessage: ContentProps = {
        role: "user",
        parts: [{ text: message }],
      };

      if (activateVoice) {

        const audioStream = await sendElevenLabsMessage(tee[1],socket);
        const audioReader = readElevenLabsMessage(audioStream);
        audioPromise = (async () => {
        for await (const audio of audioReader) {
          console.log("Playing Audio")
          streamPlayer.updateAudioQueue(audio);
        }
      })();

      }

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

      

      await Promise.all([textPromise, audioPromise]);
      
      if (activateVoice) {
        streamPlayer.updateAudioQueue('done');
      }

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
  }, [chatHistory, updateChatHistory, activateVoice]);

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
          display: 'flex',
        }}
      >
        <TextBox handleMessageSend={sendMessage} />
        <Button onClick={() => setActivateVoice(!activateVoice)}
          sx={{
            marginLeft: '10px',
          }}
          color={activateVoice ? 'success' : 'error'}
          variant="contained"
        >Activate Voice</Button>
      </Box>
    </Box>
  )
}

export default NiaInterface;
