import React, { useEffect, useState, useRef } from 'react';
import { CubismFramework, Option } from '@framework/live2dcubismframework';
import * as LAppDefine from './lappdefine';
import { LAppDelegate } from './lappdelegate';

interface ReactLiveCubismProps {
  width?: string;
  height?: string;
  bottom?: string;
  right?: string;
  release?: boolean;
  ModelList?: string[];
  TouchBody?: string[];
  TouchHead?: string[];
  TouchDefault?: string[];
  PathFull?: string;
}

export const ReactLiveCubism: React.FC<ReactLiveCubismProps> = ({ModelList, TouchBody, TouchHead, TouchDefault, PathFull}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ gl, setGl ] = useState<WebGLRenderingContext | null>(null);
  const [lAppDelegate, setLAppDelegate] = useState<LAppDelegate | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    setGl(gl);
    if (!gl) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
   
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight / 2;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [])

  useEffect(() => {
    ModelList ? LAppDefine.lappdefineSet.setModelDir(ModelList) : LAppDefine.lappdefineSet.setModelDir([])
    TouchBody ? LAppDefine.lappdefineSet.setHitBody(TouchBody) : LAppDefine.lappdefineSet.setHitBody([])
    TouchHead ? LAppDefine.lappdefineSet.setHitHead(TouchHead) : LAppDefine.lappdefineSet.setHitHead([])
    TouchDefault ? LAppDefine.lappdefineSet.setHitDefault(TouchDefault) : LAppDefine.lappdefineSet.setHitDefault([])
    PathFull ? LAppDefine.lappdefineSet.setPathFull(PathFull) : LAppDefine.lappdefineSet.setPathFull('')
    setLAppDelegate(new LAppDelegate(canvasRef.current as HTMLCanvasElement, gl as WebGLRenderingContext));
  }, [gl])
  
  useEffect(() => {
    if (!lAppDelegate) return;
    lAppDelegate.initialize();
    lAppDelegate.run();
    return () => {
      lAppDelegate.release();
    }
  }, [lAppDelegate])

  return (
    <canvas ref={canvasRef}
      style={{
        width: '100%',    
        height: '100%',
      }}
    >
    </canvas>
  )
}
