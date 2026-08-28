export function getPlaneSize(
  viewWidth: number,
  viewHeight: number,
  isCoarse: boolean,
) {
  const imgAspect = 2048 / 1152;
  const heightFill = isCoarse ? 0.52 : 0.7;
  let h = viewHeight * heightFill;
  let w = h * imgAspect;
  const maxW = viewWidth * (isCoarse ? 0.9 : 0.78);
  if (w > maxW) {
    w = maxW;
    h = w / imgAspect;
  }
  return { width: w, height: h };
}
