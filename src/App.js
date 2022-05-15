import React, {useState, useRef, useEffect} from 'react'
import useWindowSize from './window-size'
import { GlUtil } from './gl-util'
import shaders from './shaders'
import './App.css';

const GameGL = props => {
  const domRef = useRef(null);
  const requestRef = useRef(null);
  const { height, width } = useWindowSize();
  
  useEffect(() => { 
    const pixelWidth = props.width;  
    const pixelHeight = Math.floor(pixelWidth*height/width);
    const canv = document.createElement('CANVAS');
    canv.width = pixelWidth;
    canv.height = pixelHeight;
    domRef.current.appendChild(canv);
    const glu = new GlUtil(); 
    const buffer = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]); 
    const fsize = buffer.BYTES_PER_ELEMENT;
    const frameTime = 1000/props.framerate;
    const gl = glu.setupGl(canv, shaders);
    const gameShader = 0; 
    const screenShader = 1;
    const initShader = 2;
    const paintShader = 3;
    
    glu.makeTextureFramebuffer(pixelWidth, pixelHeight);
    glu.makeTextureFramebuffer(pixelWidth, pixelHeight);
    
    glu.switchShader(gameShader)
    const glBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW)
    const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, fsize * 4, 0)
    gl.enableVertexAttribArray(aPosition)
    const aTexCoord = gl.getAttribLocation(gl.program, 'aTexCoord')
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2)
    gl.enableVertexAttribArray(aTexCoord)
    gl.uniform1f(gl.getUniformLocation(gl.program, 'uWidth'), pixelWidth);
    gl.uniform1f(gl.getUniformLocation(gl.program, 'uHeight'), pixelHeight);

    let initPoints = []; 
    for(let x = -1; x <= 1; x += 1/pixelWidth){
      for(let y = -1; y <= 1; y += 1/pixelHeight){
        if(Math.random() <= .1){
          initPoints.push(x, y);
        }
      }
    }
    glu.switchShader(initShader);
    const initBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, initBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(initPoints), gl.STATIC_DRAW)
    const iPosition = gl.getAttribLocation(gl.program, 'aPosition'); 
    gl.vertexAttribPointer(iPosition, 2, gl.FLOAT, false, fsize * 2, 0);
    gl.enableVertexAttribArray(iPosition);
    glu.switchFramebuffer(2, 0);
    gl.drawArrays(gl.POINTS, 0, initPoints.length/2);

    glu.switchShader(paintShader);
    const paintBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paintBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1]), gl.DYNAMIC_DRAW);
    const pPosition = gl.getAttribLocation(gl.program, 'aPosition'); 
    gl.vertexAttribPointer(pPosition, 2, gl.FLOAT, false, fsize * 2, 0);
    gl.enableVertexAttribArray(pPosition);
    gl.uniform1f(gl.getUniformLocation(gl.program, 'uBrushSize'), Math.max(pixelWidth*.05));

    const drawTex = (shaderInd, framebufferInd, textureInd) => {
      glu.switchFramebuffer(framebufferInd, textureInd);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      glu.switchShader(shaderInd);
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, fsize * 4, 0)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.length / 4)
    }

    let mouseX = -1;
    let mouseY = -1;
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX/width * 2 - 1;
      mouseY = e.clientY/height * 2 - 1;
    });
    let mouseDrag = false;
    window.addEventListener('mousedown', () => mouseDrag = true);
    window.addEventListener('mouseup', () => mouseDrag = false);
    const drawPaint = (framebufferInd) => {
      glu.switchFramebuffer(framebufferInd, 0);
      glu.switchShader(paintShader);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, paintBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([mouseX, -mouseY]), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(pPosition, 2, gl.FLOAT, false, fsize * 2, 0);
      gl.drawArrays(gl.POINTS, 0, 1);
    }

    let lastTime = Date.now();
    let fb1 = 1;
    const tick = () => {
      const fb0 = (fb1 % 2) + 1; 
      const currTime = Date.now()
      if(mouseDrag){
        drawPaint(fb0);
      };
      if(currTime - lastTime > frameTime){
        lastTime = currTime;
        drawTex(gameShader, fb1, fb0);
        fb1 = fb0;
      }
      drawTex(screenShader, 0, fb0);
      requestRef.current = window.requestAnimationFrame(tick);
    }
    requestRef.current = window.requestAnimationFrame(tick);
    
    return () => {
      window.cancelAnimationFrame(requestRef.current);
      domRef.current.removeChild(canv);
    }
  }, [width, height, props]);

  return (
    <section ref={domRef}></section>
  ); 
}

const GameOfLife = () => {
  const defWidth = 200; const defFr = 10;
  const [pixelWidth, setPixelWidth] = useState(defWidth);
  const [framerate, setFramerate] = useState(defFr);
  
  return (
    <section>
      <nav className='controls'>
        <div>
          <label htmlFor='pwidth'>pixel width:</label>
          <input id='pwidth' type={'text'} defaultValue={defWidth}
          onChange={e => setPixelWidth(e.target.value)}></input>
        </div>
        <div>
          <label htmlFor='frate'>framerate:</label>
          <input id='frate' type={'text'} defaultValue={defFr}
          onChange={e => setFramerate(e.target.value)}></input>
        </div>
      </nav>
      <GameGL width={pixelWidth} framerate={framerate} />
    </section>
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
