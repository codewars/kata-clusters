// reference: https://webgl2fundamentals.org/

const LINKS_COLOR = [113 / 255, 113 / 255, 122 / 255, 0.1];

export class LinksRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    /** @type {WebGL2RenderingContext} */
    const gl = canvas.getContext("webgl2");
    /** @type {WebGL2RenderingContext} */
    this.gl = gl;
    /** @type {WebGLProgram} */
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    /** @type {WebGLProgram} */
    this.program = program;

    const positionLocation = gl.getAttribLocation(program, "a_position");
    /** @type {WebGLBuffer} */
    this.positionBuffer = gl.createBuffer();
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    // Enable transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  clear() {
    /** @type {WebGL2RenderingContext} */
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /**
   * @param {number[]} points
   * @param {number} tx
   * @param {number} ty
   * @param {number} k
   */
  drawLinks(points, tx, ty, k) {
    this.clear();
    /** @type {WebGL2RenderingContext} */
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    // Set the resolution to convert pixel coordinates to clipspace
    gl.uniform2f(
      gl.getUniformLocation(this.program, "u_resolution"),
      gl.canvas.width,
      gl.canvas.height
    );
    gl.uniformMatrix3fv(
      gl.getUniformLocation(this.program, "u_matrix"),
      false,
      // prettier-ignore
      [
        k, 0, 0,
        0, k, 0,
        tx, ty, 1,
      ]
    );

    // Set coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.uniform4fv(gl.getUniformLocation(this.program, "u_color"), LINKS_COLOR);

    gl.lineWidth(k);
    gl.drawArrays(gl.LINES, 0, points.length / 2);
  }
}

// Converts the position from pixels to clipspace
// `position/resolution * 2.0 - 1.0` ([0, 1] to [0, 2] to [-1, 1])
// https://webgl2fundamentals.org/webgl/lessons/webgl-2d-translation.html
const vertexShaderSource = `#version 300 es
// X, Y coordinates
in vec2 a_position;
// The resolution of the canvas
uniform vec2 u_resolution;
// The transform matrix.
uniform mat3 u_matrix;

void main() {
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;
  vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

// Set the color of the lines
const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec4 u_color;
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} vs
 * @param {string} fs
 */
function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, loadShader(gl, vs, gl.VERTEX_SHADER));
  gl.attachShader(program, loadShader(gl, fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Failed to link program: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} shaderSource
 * @param {string} shaderType
 */
function loadShader(gl, shaderSource, shaderType) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}
