import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { CubismFramework } from '@framework/live2dcubismframework';

export const Avatar = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState<WebGLRenderingContext | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    setGl(gl);
    console.log('gl', gl);

  }, []);   

  return (
      <div>
      <canvas ref={canvasRef}/>
    </div>
  )
}
