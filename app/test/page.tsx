'use client'

import React, { useState } from 'react';
import ReactLive2d from "@/components/liveCubism";

export default function Page() {
  const [ release, setRelease ] = useState(false)

  return (
    <>
      <ReactLive2d
        width="100%"
        height="100%"
        bottom={'10px'}
        right={'10px'}
        ModelList={['z46_3', 'Haru','Hiyori']}
        release={release}
      />
    </>
  );
}
