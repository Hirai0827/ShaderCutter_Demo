import React, {CSSProperties} from "react";

interface NeumorphFrameProps {
    style?:CSSProperties;
    color?:string;
    isNoMargin?:boolean;
}

export const NeumorphFrame:React.FC<NeumorphFrameProps> = (props) => {
    return (
        <div style={props.style}>
            <div style={{
                borderRadius: "19px",
                background: props.color ?props.color : "#2d2d2d",
                boxShadow:"10px 10px 19px #171717, -10px -10px 19px #373737",
                padding:props.isNoMargin ? "0px":"10px",
                margin:"20px",
                color:"white",height:"100%",width:"100%",boxSizing:"border-box"}}>
                {props.children}
            </div>
        </div>
    )
}
