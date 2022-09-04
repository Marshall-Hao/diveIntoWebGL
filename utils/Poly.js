// 将数据放到一个方法里 可以防止被引用的时候误修改
const defAttr = () => ({
  circleDot: false,
  u_IsPOINTS: null,
  gl: null,
  vertices: [],
  geoData: [],
  size: 2,
  attrName: "",
  count: 0,
  // * 数据源
  source: [],
  // *  顶点数量，数据源尺寸
  sourceSize: 0,
  // * 元素字节数
  elementBytes: 4,
  // * 类目尺寸
  categorySize: 0,
  // * attribute属性集合
  attributes: {},
  uniforms: {},
  types: ["POINTS"],
});

export default class Poly {
  constructor(attr) {
    Object.assign(this, defAttr(), attr);
    this.init();
  }

  init() {
    const { circleDot, attrName, size, gl } = this;
    if (!gl) {
      return;
    }
    if (attrName) {
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      this.updateBuffer();
      const a_Position = gl.getAttribLocation(
        gl.program,
        attrName
      );
      // vertexAttribPointer将缓冲区对象分配给attribute 变量   size 是 数组中 几个为一个 组合 分配给顶点的位置
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

    if (circleDot) {
      this.u_IsPOINTS = gl.getUniformLocation(
        gl.program,
        "u_IsPOINTS"
      );
    }
    this.calculateSourceSize();
    this.updateAttribute();
    this.updateUniform();
  }

  calculateSourceSize() {
    const { attributes, elementBytes, source } = this;
    let categorySize = 0;
    Object.values(attributes).forEach((ele) => {
      const { size, index } = ele;
      categorySize += size;
      ele.byteIndex = index * elementBytes;
    });
    this.categorySize = categorySize;
    this.categoryBytes = categorySize * elementBytes;
    this.sourceSize = source.length / categorySize;
  }

  updateAttribute() {
    const { gl, attributes, categoryBytes, source } = this;
    const sourceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(source),
      gl.STATIC_DRAW
    );
    for (let [key, { size, byteIndex }] of Object.entries(
      attributes
    )) {
      const attr = gl.getAttribLocation(gl.program, key);
      gl.vertexAttribPointer(
        attr,
        size,
        gl.FLOAT,
        false,
        categoryBytes,
        byteIndex
      );
      gl.enableVertexAttribArray(attr);
    }
  }

  updateUniform() {
    const { gl, uniforms } = this;
    for (let [key, val] of Object.entries(uniforms)) {
      const { type, value } = val;
      const u = gl.getUniformLocation(gl.program, key);
      if (type.includes("Matrix")) {
        gl[type](u, false, value);
      } else {
        gl[type](u, value);
      }
    }
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
    const { circleDot, gl, count, u_IsPOINTS, sourceSize } =
      this;
    for (let type of types) {
      // * 点就 画圆 线就正常画
      circleDot &&
        gl.uniform1f(u_IsPOINTS, type === "POINTS");
      gl.drawArrays(gl[type], 0, sourceSize || count);
    }
  }
}
