export function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}
  
export function getHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}

function randomRangeSupplied(min, max, rand, rounded=true) {
  if (rounded)
    return Math.floor(rand * (max - min + 1)) + min;
  return (rand * (max - min + 1)) + min
}

export function randomRange(min, max, rounded=true) {
  return randomRangeSupplied(min, max, Math.random(), rounded);
}

export function randomFour(min1, max1, min2, max2, rounded=true) {
  const rand = Math.random();
  if (rand > 0.5) {
    return randomRangeSupplied(min2, max2, 2*(rand-0.5), rounded);
  } else {
    return randomRangeSupplied(min1, max1, 2*rand, rounded);
  }
}

export function randomProperty(obj) {
  var keys = Object.keys(obj);
  return obj[keys[ keys.length * Math.random() << 0]];
};

export function propertyLength(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

export function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

export function padZero(num, size) {
  return ('000000000' + num).substr(-size);
}