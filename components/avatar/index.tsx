import { CubismFramework } from '@framework/live2dcubismframework';
import path from 'path';
import fs from 'fs';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';

export async function getServerSideProps() {
  const Module = await import ("@/Core/live2dcubismcore.min.js");
  const Live2DCubismCore = Module.default();
  
  return {
    props: {
      test: Live2DCubismCore,
    }
  }
}

export default async function Page() {
  const test = await getServerSideProps();
  console.log(test);
  return (
    <div>
      <h1>Live2D Cubism Framework</h1>
    </div>
  );
}
