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

export function randomRange(min, max, rounded=true) {
  if (rounded)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  return (Math.random() * (max - min + 1)) + min
}