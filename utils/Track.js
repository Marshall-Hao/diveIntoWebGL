export default class Track {
  constructor(target) {
    this.target = target;
    this.parent = null;
    this.start = 0;
    // 5ms
    this.timeLen = 5;
    this.loop = false;
    this.keyMap = new Map();
  }

  update(t) {
    const { keyMap, timeLen, target, loop } = this;

    // 本地时间1
    let time = t - this.start;
    if (loop) {
      time = time % timeLen;
    }
    for (const [key, fms] of keyMap.entries()) {
      const last = fms.length - 1;
      if (time < fms[0][0]) {
        target[key] = fms[0][1];
      } else if (time > fms[1][0]) {
      } else {
        // 最后一个
        target[key] = getValBetweenFms(time, fms, last);
      }
    }
  }
}

function getValBetweenFms(time, fms, last) {
  for (let i = 0; i < last; i++) {
    const fm1 = fms[i];
    const fm2 = fms[i + 1];
    if (time >= fm1[0] && time <= fm2[0]) {
      const delta = {
        x: fm2[0] - fm1[0],
        y: fm2[1] - fm1[1],
      };
      const k = delta.y / delta.x;
      const b = fm1[1] - fm1[0] * k;
      return k * time + b;
    }
  }
}
