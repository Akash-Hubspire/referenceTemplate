const uploadMediaToS3 = async ({signedUrl, uri, filename, mimeType}) => {
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', signedUrl);
  xhr.setRequestHeader('Content-Type', mimeType);
  xhr.send({uri, type: mimeType, name: filename});
  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseURL.split('?')[0]);
        } else {
          reject(new Error('Unable to upload media...'));
        }
      }
    };
  });
};

export default {
  uploadMediaToS3,
};
