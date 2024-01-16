type Message = {
  role: string;
  content: string;
}

type Contents = {
  role: string;
  parts: {
    text: string;
  }[];
}


export function convertGooglePrompt(messages) {
  const contents: Contents[] = [];
  let lastRole = '';
  let currentText = '';

  messages.forEach((message: Message, index: Number) => {
    const role = message.role === 'assistant' ? 'model' : 'user';

    if (lastRole === role) {
      currentText += '\n\n' + message.content;
    }
    else {
      if (currentText !== '') {
        contents.push({
          role: lastRole,
          parts: [{
            text:currentText.trim()
          }]
        });
      }

      currentText = message.content;
      lastRole = role;
    }
    if (index === messages.length - 1) {
      contents.push({
        role: lastRole,
        parts: [{
          text: currentText.trim()
        }]
      })
    }
  })

  return contents;
}
