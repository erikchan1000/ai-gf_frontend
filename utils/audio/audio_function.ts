export function createAudioBufferFromBase64(base64Data: string): Promise<Buffer>{
  return new Promise((resolve, reject) => {
    try {
      const decodedData = Buffer.from(base64Data, 'base64');
      resolve(decodedData);
    } catch (error) {
      reject(error);
    }
  });
}
