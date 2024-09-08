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

    }, [LAppDelegate]);

    useEffect(() =>{
        if(props.release==true){
            LAppDelegate.releaseInstance();
        }
    }, [props.release])

    return (
      <div
        style={{
          width: "100%",
        }}
        className="live2d-container"
      >
      </div>
    )
}

export default ReactLive2d
