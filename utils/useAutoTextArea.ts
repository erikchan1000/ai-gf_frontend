import { useEffect } from 'react';

const useAutoTextArea = (textAreaRef: React.RefObject<HTMLTextAreaElement>, value: string) => {
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `max(50px, ${textAreaRef.current.scrollHeight}px)`;
    }
  }, [textAreaRef, value]);
};

export default useAutoTextArea;

