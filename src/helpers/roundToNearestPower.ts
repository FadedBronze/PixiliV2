export const roundToNearestPow = (x: number, pow: number) =>
  Math.pow(pow, Math.floor(Math.log(x) / Math.log(pow)));
