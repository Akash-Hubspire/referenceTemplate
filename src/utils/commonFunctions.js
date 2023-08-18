import {Image} from 'react-native';

// removes whitespace from both sides and allows only single space in between the words
const removeWhiteSpaces = string => {
  if (string) {
    return string.replace(/\s+/g, ' ').trim();
  }
  return '';
};

const isEmpty = obj => {
  if (!obj) {
    return true;
  }
  const string = JSON.stringify(obj);
  return string === '{}' || string === '[]';
};

const formatPhoneNumber = num => {
  const newNum = `${num}`.replace(/\D/g, '');
  if (newNum) {
    let x;
    if (newNum.length <= 1) {
      x = `${newNum}`;
    } else if (newNum.length <= 3) {
      x = `(${newNum}`;
    } else if (newNum.length > 3 && newNum.length <= 6) {
      x = `(${newNum.slice(0, 3)}) ${newNum.slice(3, 6)}`;
    } else {
      x = `(${newNum.slice(0, 3)}) ${newNum.slice(3, 6)}-${newNum.slice(
        6,
        10,
      )}`;
    }
    return x;
  }
  return '';
};

const formatError = errMessage => {
  if (errMessage) {
    const splitImage = errMessage?.split('\n');
    return splitImage[0];
  }
  return '';
};

export const getImageSize = uri =>
  new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({width, height});
      },
      () => {
        reject(new Error('failed to calculate image size'));
      },
    );
  });

export default {
  removeWhiteSpaces,
  getImageSize,
  isEmpty,
  formatPhoneNumber,
  formatError,
};
