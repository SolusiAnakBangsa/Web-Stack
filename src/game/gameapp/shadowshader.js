const myVertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

const myFragment = `
    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform vec4 inputSize;
    uniform vec4 outputFrame;
    uniform vec2 shadowDirection;
    uniform float floorY;
    uniform float opacity;

    void main(void) {
        
        vec2 screenCoord = vTextureCoord * inputSize.xy + outputFrame.xy;
        
        vec2 shadow;
        //shadow coordinate system is a bit skewed, but it has to be the same for screenCoord.y = floorY

        float paramY = (screenCoord.y - floorY) / shadowDirection.y;
        shadow.y = paramY + floorY;
        shadow.x = screenCoord.x + paramY * shadowDirection.x;
        vec2 bodyFilterCoord = (shadow - outputFrame.xy) * inputSize.zw; // same as / inputSize.xy

        vec4 originalColor = texture2D(uSampler, vTextureCoord);
        vec4 shadowColor = texture2D(uSampler, bodyFilterCoord);
        shadowColor.rgb = vec3(0.0);
        shadowColor.a *= opacity;

        // normal blend mode coefficients (1, 1-src_alpha)
        // shadow is destination (backdrop), original is source
        gl_FragColor = originalColor + shadowColor * (1.0 - originalColor.a);
    }
    `;

export class ShadowShader extends PIXI.Filter {
    constructor(shadowDirection, floorY, opacity = 0.2) {
        super(myVertex, myFragment);

        this.uniforms.shadowDirection = shadowDirection;
        this.uniforms.floorY = floorY;
        this.uniforms.opacity = opacity;

        this.padding = 256;
        this.resolution = 3;
    }
}
