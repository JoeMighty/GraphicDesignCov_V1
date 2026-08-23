export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uVelocity;
  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

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

    // Glitch jitter — quick, stepped horizontal slice offsets while hovered.
    float slice = floor(uv.y * 14.0 + uTime * 8.0);
    float jitter = (hash(slice) - 0.5) * uHover;
    pos.x += jitter * 0.05;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Chromatic-aberration glitch: sample each colour channel at a slightly
    // different, jittering offset while hovered.
    float wobble = 0.5 + 0.5 * sin(uTime * 45.0 + vUv.y * 30.0);
    vec2 offset = vec2(0.012, 0.0) * uHover * wobble;

    float r = texture2D(uTexture, vUv + offset).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - offset).b;
    float a = texture2D(uTexture, vUv).a;

    vec3 tex = vec3(r, g, b);
    float gray = dot(tex, vec3(0.299, 0.587, 0.114));
    vec3 color = mix(vec3(gray), tex, 0.4 + uHover * 0.6);

    gl_FragColor = vec4(color, a);
  }
`;
