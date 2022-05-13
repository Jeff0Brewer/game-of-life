const shaders = [`
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main(){
      gl_Position = vec4(aPosition.xy, 0.0, 1.0);
      vTexCoord = aTexCoord;
    }`, `
    precision highp float;
    uniform sampler2D uSampler;
    varying vec2 vTexCoord;
    
    void main(){
      gl_FragColor = texture2D(uSampler, vTexCoord - vec2(0.0, 0.01));
    }`,`
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main(){
      gl_Position = vec4(aPosition.xy, 0.0, 1.0);
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
        gl_PointSize = 20.0;
    }`,
    `
    precision highp float;

    void main(){
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        if(dot(cxy, cxy) > 1.0) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`
]

export default shaders;