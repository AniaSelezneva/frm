// Remove unnecessary spaces from user's handle
export default (handle) => {
  const arr = handle.split(" ");
  const arrNoSpaces = [];
  arr.forEach((str) => {
    if (str !== "") {
      arrNoSpaces.push(str);
    }
  });
  const result = arrNoSpaces.join(" ");
  return result;
};
