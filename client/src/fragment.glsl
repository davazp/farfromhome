uniform vec3 color;
uniform sampler2D texture;
varying vec4 vColor;
void main() {
  gl_FragColor = vec4( vColor ) * texture2D( texture, gl_PointCoord );
}
