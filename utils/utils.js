export function initShaders(gl, vsSource, fsSource) {
  //创建程序对象
  const program = gl.createProgram();
  //建立着色对象
  const vertexShader = loadShader(
    gl,
    gl.VERTEX_SHADER,
    vsSource
  );
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fsSource
  );
  //把顶点着色对象装进程序对象中
  gl.attachShader(program, vertexShader);
  //把片元着色对象装进程序对象中
  gl.attachShader(program, fragmentShader);
  //连接webgl上下文对象和程序对象
  gl.linkProgram(program);
  //启动程序对象
  gl.useProgram(program);
  //将程序对象挂到上下文对象上
  gl.program = program;
  return true;
}

export function loadShader(gl, type, source) {
  //根据着色类型，建立着色器对象
  const shader = gl.createShader(type);
  //将着色器源文件传入着色器对象中
  gl.shaderSource(shader, source);
  //编译着色器对象
  gl.compileShader(shader);
  //返回着色器对象
  return shader;
}

export function getMousePosInWebgl(event, canvas) {
  const { clientX, clientY } = event;
  const { left, top, width, height } =
    canvas.getBoundingClientRect();
  const [cssX, cssY] = [clientX - left, clientY - top];

  const [halfWidth, halfHeight] = [width / 2, height / 2];
  // 视频向量差
  const [xBaseCenter, yBaseCenter] = [
    cssX - halfWidth,
    cssY - halfHeight,
  ];

  // 解决y方向差异 webgl是反的
  const yBaseCenterTop = -yBaseCenter;

  // 转换为webgl坐标
  const [x, y] = [
    xBaseCenter / halfWidth,
    yBaseCenterTop / halfHeight,
  ];

  return {
    x,
    y,
  };
}

export function glToCssPos({ x, y }, { width, height }) {
  const [halfWidth, halfHeight] = [width / 2, height / 2];
  return {
    x: x * halfWidth,
    y: -y * halfHeight,
  };
}

export function ScaleLinear(ax, ay, bx, by) {
  const delta = {
    x: bx - ax,
    y: by - ay,
  };
  const k = delta.y / delta.x;
  const b = ay - ax * k;
  return function (x) {
    return k * x + b;
  };
}

export function SinFn(a, Omega, phi) {
  return function (x) {
    return a * Math.sin(Omega * x + phi);
  };
}

export function GetIndexInGrid(w, size) {
  return function (x, y) {
    console.log(x, y);
    return (y * w + x) * size;
  };
}
