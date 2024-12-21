'use client'

import React, { useEffect, useState } from 'react';
import ReactLive2d from "@/components/liveCubism";

export default function Page() {
  const [ release, setRelease ] = useState(false)
  const handleClick = () => {
    setRelease(true)
  }


  return (
    <>
      <button onClick={handleClick}>test</button>
      <ReactLive2d
        width="100%"
        height="100%"
        bottom={'10px'}
        right={'10px'}
        ModelList={['Haru','Hiyori']}
        release={release}
      />

    </>
  );
}
