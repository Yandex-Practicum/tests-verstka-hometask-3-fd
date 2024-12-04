const sortColors = (colors) => colors.sort((color1, color2) => (
  color1.reduce((acc, channel, index) => acc || channel - color2[index], 0)
));

const compareColors = (color1, color2, tolerance = 10) => (
  color1.every((channel, index) => Math.abs(channel - color2[index]) <= tolerance)
);

export {
  sortColors,
  compareColors,
};
