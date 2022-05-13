import React, {useRef, useEffect} from 'react'
import useWindowSize from './window-size'
import { GlUtil } from './gl-util'
import shaders from './shaders'
import './App.css';

const GameOfLife = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const { height, width } = useWindowSize();
  const pixelWidth = 600;  
  const pixelHeight = Math.floor(pixelWidth*height/width);

  useEffect(() => {
    const glu = new GlUtil(); 
    const buffer = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]); 
    const fsize = buffer.BYTES_PER_ELEMENT;
    const frameTime = 1000/10;
    const gl = glu.setupGl(canvasRef.current, shaders);
    const gameShader = 0; const screenShader = 1; const initShader = 2;

    glu.makeTextureFramebuffer(pixelWidth, pixelHeight) 
    glu.makeTextureFramebuffer(pixelWidth, pixelHeight)
    
    glu.switchShader(0)
    const glBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW)

    const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, fsize * 4, 0)
    gl.enableVertexAttribArray(aPosition)

    const aTexCoord = gl.getAttribLocation(gl.program, 'aTexCoord')
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2)
    gl.enableVertexAttribArray(aTexCoord)

    glu.switchShader(initShader);
    const initBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, initBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0]), gl.STATIC_DRAW)
    const iPosition = gl.getAttribLocation(gl.program, 'aPosition'); 
    gl.vertexAttribPointer(iPosition, 2, gl.FLOAT, false, fsize * 2, 0);
    gl.enableVertexAttribArray(iPosition);
    glu.switchFramebuffer(2, 0);
    gl.drawArrays(gl.POINTS, 0, 1);

    const drawTex = (shaderInd, framebufferInd, textureInd) => {
      glu.switchFramebuffer(framebufferInd, textureInd);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      glu.switchShader(shaderInd);
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, fsize * 4, 0)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.length / 4)
    }

    let lastTime = Date.now();
    let fb1 = 1;
    const tick = () => {
      const currTime = Date.now();
      if(currTime - lastTime > frameTime){
        lastTime = currTime;

        const fb0 = (fb1 % 2) + 1; 
        drawTex(gameShader, fb1, fb0);
        drawTex(screenShader, 0, fb1);
        fb1 = fb0;
      }

      requestRef.current = window.requestAnimationFrame(tick);
    }
    requestRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(requestRef.current);
    }
  }, [pixelWidth, pixelHeight]);

  return (
    <canvas ref={canvasRef} width={pixelWidth} height={pixelHeight}></canvas>
  ); 
}

const App = () => {
  return (
    <main>
      <GameOfLife />
    </main> 
  );
}

export default App;
