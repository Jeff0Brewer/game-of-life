const shaders = [`
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main(){
      gl_Position = vec4(aPosition.xy, 0.0, 1.0);
      vTexCoord = aTexCoord;
    }`, `
    precision highp float;
    uniform float uWidth;
    uniform float uHeight;
    uniform sampler2D uSampler;
    varying vec2 vTexCoord;
    
    void main(){
      float px = 1.0/uWidth;
      float py = 1.0/uHeight;
      float adj = 0.0;
      adj += texture2D(uSampler, vTexCoord + vec2(px, 0.0)).x;
      adj += texture2D(uSampler, vTexCoord + vec2(-px, 0.0)).x;
      adj += texture2D(uSampler, vTexCoord + vec2(0.0, py)).x;
      adj += texture2D(uSampler, vTexCoord + vec2(0.0, -py)).x;
      adj += texture2D(uSampler, vTexCoord + vec2(px, py)).x;
      adj += texture2D(uSampler, vTexCoord + vec2(-px, py)).x;
      adj += texture2D(uSampler, vTexCoord + vec2(-px, -py)).x;
      adj += texture2D(uSampler, vTexCoord + vec2(px, -py)).x;
      gl_FragColor = texture2D(uSampler, vTexCoord);
      float live = gl_FragColor.x;
      if(live == 1.0 && (adj < 2.0 || adj > 3.0)){
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
      else if(live != 1.0 && adj == 3.0){
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    }`,`
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main(){
      gl_Position = vec4(aPosition, 0.0, 1.0);
      vTexCoord = aTexCoord;
    }`, `
    precision highp float;
    uniform sampler2D uSampler;
    varying vec2 vTexCoord;
    
    void main(){
      gl_FragColor = texture2D(uSampler, vTexCoord);
    }`,`    
    attribute vec2 aPosition; 
    void main(){
      gl_Position = vec4(aPosition, 0.0, 1.0);
      gl_PointSize = 1.0;
    }`,
    `
    precision highp float;
    void main(){
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`,`
    attribute vec2 aPosition;
    uniform float uBrushSize;
    void main(){
      gl_Position = vec4(aPosition, 0.0, 1.0);
      gl_PointSize = uBrushSize;
    }`,`
    precision highp float;
    float rand(vec2 co){
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }
    void main(){
      vec2 cxy = gl_PointCoord*2.0 - 1.0;
      if(dot(cxy, cxy) > 1.0 || rand(cxy) > .2){
        discard;
      }
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`
]

export default shaders;