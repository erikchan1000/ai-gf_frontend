import React, {useState, useRef} from 'react';
import useAutoTextArea from '@/utils/useAutoTextArea';

interface TextBoxProps {
  handleMessageSend: (message: string) => void;
}

export const TextBox: React.FC<TextBoxProps> = ({handleMessageSend}) => {
  const [inputText, setInputText] = useState<string>('');
  //adjust the height of the text box based on the amount of text
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useAutoTextArea(textAreaRef, inputText);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log(e.currentTarget.value);
      handleMessageSend(e.currentTarget.value);
      setInputText('');
    }
  }
  
   return (
    <form style={{
        width: '100%'
    }}
    >
      <textarea value={inputText} placeholder="Message"
        className="border-2 border-gray-400 rounded-lg p-2 w-96 h-12"
        style={{
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
        }}
        onKeyDown={handleKeyPress}      
        onChange={handleChange}
        rows={1}
        ref={textAreaRef}
      />
    </form>
  )
}
