// 将数据放到一个方法里 可以防止被引用的时候误修改
const defAttr = () => ({
  gl: null,
  vertices: [],
  geoData: [],
  size: 2,
  attrName: "a_Position",
  count: 0,
  types: ["POINTS"],
});

export default class Poly {
  constructor(attr) {
    Object.assign(this, defAttr(), attr);
    this.init();
  }

  init() {
    const { attrName, size, gl } = this;
    if (!gl) {
      return;
    }
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    this.updateBuffer();
    const a_Position = gl.getAttribLocation(
      gl.program,
      attrName
    );
    // size 是 数组中 几个为一个 组合 分配给顶点的位置
    gl.vertexAttribPointer(
      a_Position,
      size,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(a_Position);
  }

  updateBuffer() {
    const { gl, vertices } = this;
    this.updateCount();
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.STATIC_DRAW
    );
  }
  updateCount() {
    this.count = this.vertices.length / this.size;
  }

  addVertice(...params) {
    this.vertices.push(...params);
    this.updateBuffer();
  }
  popVertice() {
    const { vertices, size } = this;
    const len = vertices.length;
    vertices.splice(len - size, len);
    this.updateCount();
  }
  setVertice(ind, ...params) {
    const { vertices, size } = this;
    const i = ind * size;
    params.forEach((param, paramInd) => {
      vertices[i + paramInd] = param;
    });
  }

  updateVertices(params) {
    const { geoData } = this;
    const vertices = [];
    geoData.forEach((data) => {
      params.forEach((key) => {
        vertices.push(data[key]);
      });
    });
    this.vertices = vertices;
  }
  draw(types = this.types) {
    const { gl, count } = this;
    for (let type of types) {
      gl.drawArrays(gl[type], 0, count);
    }
  }
}
