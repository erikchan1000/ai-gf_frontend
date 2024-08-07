'use client';

import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { TextBox } from '@/components/textbox';
import { sendGeminiMessage, readGeminiMessage } from '@/utils/sendGeminiMessage';
import { MessageHistoryProps, ContentProps } from '@/components/nia_interface/interface';
import { MessageHistory } from '@/components/message_history';
import { sendElevenLabsMessage, readElevenLabsMessage, createSocket } from '@/utils/sendElevenLabsMessage';
import { StreamPlayer, StreamPlayerType } from '@/utils/audio_queue';
import Introduction from '@/components/introduction';
import { FinishedContext } from '@/utils/finishedContext';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const NiaInterface = () => {

  const [response, setResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<MessageHistoryProps>({ contents: [] });
  const [error, setError] = useState<boolean>(false);
  const [activateVoice, setActivateVoice] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const finishedContext = useContext<any>(FinishedContext);
  const [ voiceContext, setVoiceContext ] = useState<string>("none")
  const [ prompt, setPrompt ] = useState<string>("")

  let streamPlayer: StreamPlayerType | null = null;

  const invertVoice = () => {
    setActivateVoice(!activateVoice);
  }

  useEffect(() => {
    if (scrollRef.current && autoScroll) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [chatHistory, autoScroll])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight === scrollHeight) {
        setAutoScroll(true);
      }
      else {
        setAutoScroll(false);
      }
    }
  }
  

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
    finishedContext.setFinished(false);

    setAutoScroll(true);
    if (!streamPlayer) {
      streamPlayer = new StreamPlayer(finishedContext.setFinished);
    }
    setLoading(true);
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

      setLoading(false);

      const textPromise = (async () => {
        for await (const response of reader) {
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

      console.log("Finished Streaming");

    }
    catch (error) {
      console.error("Error sending Gemini Message: ", error);
      setResponse("Error sending message, try again later.");
      setError(true);
    }
  }, [chatHistory, updateChatHistory, activateVoice]);

  console.log("Voice Context: ", voiceContext);

  useEffect(() => {
    const fetchData = async () => {
      if (voiceContext === "nia") {
        console.log("Fetching Data")
        const json = await fetch("/api/getJson")
        const data = await json.json()
        console.log("Data: ", data)
        setPrompt(data)
      }
      else {
        setPrompt("")
      } 
    }
    fetchData()  
  }
  , [voiceContext]);

  console.log("Prompt: ", prompt)

  useEffect(() => {
    const updateModelData = async () => {
      console.log("Updating")
      console.log("Response: ", response)
      const json = await fetch("/api/test/update", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt)
      })
    }
    updateModelData()
  }, [prompt])

  
  

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
      <div
        style={{
          width: '100%',
          display: 'inline-flex'
        }}
      >
        <Typography variant="h6"
          sx={{
            color: 'white',
            opacity: 0.6,
            marginRight: 'auto'
          }}
        >Nia AI Assistant Beta v0.1</Typography>
        <FormControl
          sx={{
            color: 'white',
            opacity: 0.6,
            height: '100%',
            width: '150px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          variant="filled"
        >
          <InputLabel id="voice-context"
            sx={{
              color: 'white',
              opacity: 1,
            }}
          >Voice Context</InputLabel>
          <Select
            labelId="voice-context"
            id="voice-context"
            value={voiceContext}
            onChange={(e) => setVoiceContext(e.target.value)}
            sx={{
              color: 'white',
              opacity: 1,
              '&:before': {
                borderColor: 'gray',
              },
              '&:after': {
                borderColor: 'gray',
              },
              '.MuiSelect-icon': {
                color: 'white',
              },
            }}
            MenuProps={{
              PaperProps: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                '& .MuiMenuItem-root': {
                  color: 'white',
                },
                '& .MuiMenuItem-root.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '& .MuiMenuItem-root:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              },
            },
        }}
          >
            <MenuItem value={"none"}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            >None</MenuItem>
            <MenuItem value={"nia"}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            >Nia</MenuItem>
          </Select>
        </FormControl>
      </div>
      <Box
        flex="1"
        overflow="scroll"
        sx={{
          width: '80%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '30px', 
          marginBottom: '30px',
        }}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <Introduction display={chatHistory.contents.length === 0} />
        <MessageHistory contents={chatHistory.contents} loading={loading}/>
      </Box>
      <Box
        sx={{
          display: 'flex',
          position: "relative",
          width: '80%',

          '@media (max-width: 600px)': {
            width: '90%',
          },
        }}
      >
        <TextBox handleMessageSend={sendMessage}
          activateVoice={invertVoice}
          activateVoiceState={activateVoice}
        />
      </Box>
    </Box>
  )
}

export default NiaInterface;
