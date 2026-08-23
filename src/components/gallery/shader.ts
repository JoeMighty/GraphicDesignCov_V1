export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Scroll skew — shears the plane along X based on scroll velocity,
    // normalized to this plane's own size so the effect reads the same
    // regardless of the thumbnail's on-screen dimensions.
    pos.x += uVelocity * (uv.y - 0.5);

    // Hover ripple — an assertive in-plane wobble (XY, not Z: this camera
    // is orthographic, so pure depth displacement wouldn't be visible).
    float waveX = sin(uv.y * 7.0 + uTime * 4.0) * uHover;
    float waveY = sin(uv.x * 5.0 + uTime * 3.2) * uHover;
    pos.x += waveX * 0.09;
    pos.y += waveY * 0.07;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 color = mix(vec3(gray), tex.rgb, 0.4 + uHover * 0.6);
    gl_FragColor = vec4(color, tex.a);
  }
`;
