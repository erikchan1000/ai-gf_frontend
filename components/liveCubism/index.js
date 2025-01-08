import { LAppDelegate } from './lappdelegate';
import { LAppLive2DManager } from './lapplive2dmanager';
import * as LAppDefine from './lappdefine';
import React, { useState, useEffect } from 'react';
import './asset/index.css'

function ReactLive2d(props) {
    let timer = null;

    const [controllerOn, setControllerOn] = useState(false)

    const [controllerIn, setControllerIn] = useState(false)

    function cvMouseOver() {
        setControllerOn(true)
    }

    function cvMouseOut() {
        timer = setTimeout(() => {
            if (!controllerIn) {
                setControllerOn(false)
                setControllerIn(false)
            }
        }, 10);
    }

    function ctMouseOver() {
        setControllerIn(true)
        clearTimeout(timer)
    }

    function ctMouseOut() {
        setControllerIn(false)
    }

    function ctTab() {
        LAppLive2DManager.getInstance().nextScene();
    }

    function talkPrint(print) {
        let printNow = document.getElementById('live2d-print');
        printNow.innerHTML = print;
        printNow.style.display = 'block';
    }

    function cancelPrint() {
        let printNow = document.getElementById('live2d-print');
        printNow.innerHTML = '';
        printNow.style.display = 'none';
    }

    const [ live2dManager, setLive2dManager ] = useState(undefined)
    const [ motionManager, setMotionManager ] = useState(undefined)
    const [ motions, setMotions ] = useState([])
    useEffect(() => {
        props.ModelList ? LAppDefine.lappdefineSet.setModelDir(props.ModelList) : LAppDefine.lappdefineSet.setModelDir([])
        props.TouchBody ? LAppDefine.lappdefineSet.setHitBody(props.TouchBody) : LAppDefine.lappdefineSet.setHitBody([])
        props.TouchHead ? LAppDefine.lappdefineSet.setHitHead(props.TouchHead) : LAppDefine.lappdefineSet.setHitHead([])
        props.TouchDefault ? LAppDefine.lappdefineSet.setHitDefault(props.TouchDefault) : LAppDefine.lappdefineSet.setHitDefault([])
        props.PathFull ? LAppDefine.lappdefineSet.setPathFull(props.PathFull) : LAppDefine.lappdefineSet.setPathFull('')
        if (!navigator.userAgent.match(/mobile/i) || props.MobileShow == true) {

          if (LAppDelegate.getInstance().initialize() == false) {
              console.log("initialize failed");
              return;
          }

          LAppDelegate.getInstance().run();
        }
        setLive2dManager(LAppLive2DManager.getInstance());

    }, [LAppDelegate]);


    useEffect(() =>{
        if(props.release==true){
            LAppDelegate.releaseInstance();
        }
    }, [props.release])

    useEffect(() => {
      setMotionManager(live2dManager?.getModel(0).getMotionManager())
      setMotions(live2dManager?.getModel(0).getMotions()?._keyValues)
    }, [live2dManager])

    console.log("Motions: ", motions)

    const getModels = () => {
      console.log("First model: ", live2dManager.getModel(0))
    }

    const getAllModels = () => {
        console.log("All models: ", live2dManager.getAllModels())
    }

    const nextMotion = () => {
      const model = live2dManager.getModel(0);
      model.startMotion("Mail", 0, 3);
    }

    console.log("Motion Manager: ", motionManager)
    console.log("Live2d manager: ", live2dManager)



    return (
    <div
      style= {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        maxWidth: '100vw',
      }}
    >
      <div
        style={{
          width: "100%",
        }}
        className="live2d-container"
      >
      </div>
      <button
        style={{
          backgroundColor: 'blue',
          color: 'white',
          width: '100px',
          margin: 'auto'
        }}
        onClick={() => {
          getModels()
          getAllModels()
        }}
      >
        Test
      </button>
      <button
        style={{
          backgroundColor: 'blue',
          color: 'white',
          width: '100px',
          margin: 'auto'
        }}
        onClick={() => {
          nextMotion()
        }}
        >
          Next Motion
      </button>
    </div>
    )
}

export default ReactLive2d
