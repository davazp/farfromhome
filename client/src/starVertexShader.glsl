uniform vec2 uvScale;
varying vec2 vUv;
uniform float alpha;
varying float vAlpha;
void main()
{
  vAlpha = alpha;
  vUv = uvScale * uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
