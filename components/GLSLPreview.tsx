import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {
    ClampToEdgeWrapping,
    Mesh, NearestFilter,
    OrthographicCamera,
    PlaneBufferGeometry,
    RawShaderMaterial, RGBAFormat,
    Scene, Vector3,
    WebGLRenderer, WebGLRenderTarget
} from "three";

interface PreviewProps {
    code:string,
    onCompileFinished?:(isSuccess:boolean,errorLog?:string) => void;
    height:string|number;
    width:string|number;
    id?:string;
    style?:CSSProperties;
}

export const GLSLPreview: React.FC<PreviewProps> = (props) => {
    const [shouldUpdate,setShouldUpdate] = useState(false);
    const refShouldUpdate = useRef(shouldUpdate);
    const refCode = useRef(props.code);
    const updateTrigger = useRef(setTimeout(() => {},10000000));

    const vertex = `
precision highp float;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
void main(){

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position , 1.);

}
`;

    const createRenderTarget = ( width, height ) => {
        return new WebGLRenderTarget( width, height, {
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false
        });
    };

    useEffect(() => {
        let c:HTMLCanvasElement = document.querySelector("#"+ (props.id ? props.id:"GLSLCanvas"));
        const renderer:WebGLRenderer = new WebGLRenderer({canvas:c});
        //renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(c.clientWidth, c.clientHeight);
        renderer.autoClearColor = false;
        const camera:OrthographicCamera = new OrthographicCamera(-1,1,1,-1,-1,1);
        const scene:Scene = new Scene();
        const plane:PlaneBufferGeometry = new PlaneBufferGeometry(2,2);

        const material:RawShaderMaterial = new RawShaderMaterial({
            fragmentShader: props.code,
            vertexShader:vertex,
            uniforms:{time:{value:0.0},resolution:{value:new Vector3()}}
        });

        const mesh =new Mesh(plane,material);
        scene.add(mesh);
        const srcTex = createRenderTarget(c.clientWidth,c.clientHeight);
        const dstTex = createRenderTarget(c.clientWidth,c.clientHeight);
        render(renderer,scene,camera,material,mesh,srcTex,dstTex,new Date().getTime());
    },[]);

    const windowResizeWhenNeeded = (renderer:WebGLRenderer,srcTex:WebGLRenderTarget,dstTex:WebGLRenderTarget) => {
        let c:HTMLCanvasElement = document.querySelector("#"+ (props.id ? props.id:"GLSLCanvas"));
        if(c == null){
            return [srcTex,dstTex];
        }
        //const renderer:WebGLRenderer = new WebGLRenderer({canvas:c});
        if(Math.abs(c.width - c.clientWidth*window.devicePixelRatio) < 4.0 && Math.abs(c.height - c.clientHeight*window.devicePixelRatio) < 4.0){
            return [srcTex,dstTex];
        }
        c.width = c.clientWidth;
        c.height = c.clientHeight;
        //renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(c.clientWidth, c.clientHeight);
        srcTex = createRenderTarget(c.clientWidth,c.clientHeight);
        dstTex = createRenderTarget(c.clientWidth,c.clientHeight);
        return [srcTex,dstTex];
    };

    useEffect(() => {
        if(refCode.current == props.code){
            //return;
        }
        clearTimeout(updateTrigger.current);
        updateTrigger.current = setTimeout(() => {
            setShouldUpdate(true);
            refCode.current = props.code;
            console.log(props.code);
        },500);
    },[props.code]);

    useEffect(() => {
        refShouldUpdate.current = shouldUpdate;
    },[shouldUpdate]);

    const render = function (renderer:WebGLRenderer,scene:Scene,camera:OrthographicCamera,material:RawShaderMaterial,mesh:Mesh,srcTex:WebGLRenderTarget,dstTex:WebGLRenderTarget,prevTime:number) {
        [srcTex,dstTex] = windowResizeWhenNeeded(renderer,srcTex,dstTex);
        // renderer.setRenderTarget(dstTex);
        // renderer.render(scene,camera);
        // renderer.setRenderTarget(null);
        renderer.render(scene,camera);
        if(refShouldUpdate.current){
            const newCode = refCode.current;
            const mat = new RawShaderMaterial({
                fragmentShader: newCode,
                vertexShader:vertex,
                uniforms:material.uniforms
            });
            const gl = renderer.getContext();
            let tmp_s = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(tmp_s, newCode);
            gl.compileShader(tmp_s);
            let status = gl.getShaderInfoLog(tmp_s);
            if(status.length == 0){
                mesh.material = mat;
                material = mat;
                if(props.onCompileFinished){
                    props.onCompileFinished(true);
                }
            }else{
                if(props.onCompileFinished){
                    props.onCompileFinished(false,status);
                }
            }
            setShouldUpdate(false);
        }
        const newTime = new Date().getTime();
        material.uniforms.time.value = material.uniforms.time.value + (newTime - prevTime) * 0.001;
        material.uniforms.resolution.value.set(props.width as number,props.height as number,0.0);
        requestAnimationFrame(() =>render(renderer,scene,camera,material,mesh,dstTex,srcTex,newTime));
    };

    return (
        <canvas id={props.id ? props.id:"GLSLCanvas"} height={props.height} width={props.width} style={props.style ? props.style : {borderRadius:10}}/>
    );
};
