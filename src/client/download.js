const img_names = [
  'logo.png',
  'cellon.png',
  'picture2.png',
  'player.png',
];

const imgs = {};

const downloadPromise = Promise.all(img_names.map(downloadImage));

function downloadImage(file_name) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      console.log(`Downloaded ${file_name}`);
      imgs[file_name] = img;
      resolve();
    };
    img.src = `/static/${file_name}`;
  });
};

//export const downloadImage = () => downloadPromise;
  
//export const getImg = file_name => imgs[file_name];