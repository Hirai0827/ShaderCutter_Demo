import AceEditor from "react-ace";
import React, {useRef, useState} from "react";
import {Toolbar} from "@material-ui/core";
import {GLSLPreview} from "../components/GLSLPreview";
import {NeumorphFrame} from "../components/NeumorphFrame";
import {faCode, faImage, faCodeBranch, faCog, faBookOpen} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {GLSLAnalyzer} from "ShaderCutter/build/ShaderCutter_Core/Controller/GLSLAnalyzer";
import {GLSLCutCodeGenerator} from "ShaderCutter/build/ShaderCutter_Core/Controller/GLSLCutCodeGenerator";

export default function Home() {
    const src = `<render>
    <rot axis="y" angle="time * 1.0">
    <box/>
    <minus>
        <translate x="0.5" y="0.5" z="0.5">
            <box/>
        </translate>
    </minus>
    </rot>
</render>
`;
    const initCode = `
precision highp float;

uniform vec3 resolution;
uniform float time;

void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    uv = sin(uv + time) * 0.5 + 0.5;
    gl_FragColor = vec4(uv, cos(time) * 0.5 + 0.5, 1.0);
}`;
    const glslEditorRef = useRef(null as AceEditor);
    const [glslCode,setGlslCode] = useState(initCode);
    const [peepCode,setPeepCode] = useState(initCode);
    const [currentLine,setCurrentLine] = useState("");
    const onChange = () => {
        const src = glslEditorRef.current.editor.getValue();
        setGlslCode(src);

    };
    const onCursorChange = () => {
            const cursor = glslEditorRef.current.editor.getCursorPosition();
            const src = glslEditorRef.current.editor.getValue();
            const analyzed = GLSLAnalyzer.Analyze(src,cursor);
            console.log(analyzed);
            if(analyzed){
                const peepSrc = GLSLCutCodeGenerator.Generate(analyzed);
                console.log(peepSrc);
                setPeepCode(peepSrc);
                setCurrentLine(analyzed.depthMap[analyzed.depthMapIndex].src);
            }

    };
    require("ace-builds/src-noconflict/mode-xml");
    require("ace-builds/src-noconflict/mode-glsl");
    require("ace-builds/src-noconflict/theme-monokai");
    require("ace-builds/src-noconflict/theme-terminal");
  return (
    <div style={{position:"fixed",width:"100%",height:"100%",display:"flex",flexDirection:"column",padding:10,boxSizing:"border-box"}}>
        <link rel="stylesheet" href='main.css'/>
        <NeumorphFrame style={{height:100}}>
            <Toolbar style={{fontSize:24,minHeight:"0px",fontWeight:"bold"}}>
                <img src="Dynamis_logo.png" alt="logo" style={{height:"48px",paddingRight:10}}/>
                GLSLEditor_Sample
            </Toolbar>
            <div style={{fontSize:"14px",fontWeight:"bold",backgroundColor:"#FD7013",marginRight:100}}>
                <FontAwesomeIcon icon={faCodeBranch} style={{color:"#2D2D2D",paddingLeft:10,paddingRight:10}}/>
                ver1.0
            </div>
        </NeumorphFrame>
        <Toolbar style={{flexGrow:1}}>
            <div style={{width:"50%",height:"100%",padding:20,boxSizing:"border-box"}}>
                <NeumorphFrame style={{height:"100%"}}>
                    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
                        <div style={{marginRight:100,fontWeight:"bold"}}>
                            <div>
                                <FontAwesomeIcon icon={faCode} style={{color:"#FD7013",paddingRight:10}}/>
                                GLSL Code
                            </div>
                        </div>
                        <AceEditor style={{width:"100%",borderRadius:10,height:"100%",boxSizing:"border-box"}} fontSize={16} value={glslCode} onChange={onChange} theme={"terminal"} height={"240px"} mode={"glsl"} ref={glslEditorRef} onCursorChange={onCursorChange}/>
                    </div>
                </NeumorphFrame>
            </div>
            <div style={{width:"50%",minWidth:"700px",height:"100%",padding:20,boxSizing:"border-box"}}>
                <NeumorphFrame style={{flexGrow:1}}>
                    <div style={{marginRight:100,fontWeight:"bold"}}>
                        <div>
                            <FontAwesomeIcon icon={faImage} style={{color:"#FD7013",paddingRight:10}}/>
                            Preview
                        </div>
                    </div>
                    <div style={{textAlign:"center",height:400,width:600}}>
                        <div style={{height:400,width:600,position:"relative"}}>
                            <GLSLPreview width={600} height={400} code={glslCode} id={"canvasA"}/>
                            <GLSLPreview width={300} height={200} code={peepCode} id={"canvasB"} style={{borderRadius:10,position:"absolute",right:0,bottom:30,borderStyle:"solid",borderColor:"#FD7013"}}/>
                            <div  style={{borderRadius:10,position:"absolute",right:0,bottom:0,height:30,width:600,backgroundColor:"#FD7013",color:"white",fontWeight:"bold"}}>
                                {currentLine}
                            </div>
                        </div>
                    </div>
                </NeumorphFrame>
            </div>
        </Toolbar>
    </div>
  )
}
