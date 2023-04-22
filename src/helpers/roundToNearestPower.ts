export const roundToNearestPow = (
  x: number,
  pow: number,
  roundMethod: "ceil" | "round" | "floor"
) => Math.pow(pow, Math[roundMethod](Math.log(x) / Math.log(pow)));
