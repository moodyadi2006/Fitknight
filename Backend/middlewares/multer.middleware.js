import multer from 'multer';

const storage = multer.diskStorage({
  //We can also use memoryStorage but not preferred
  destination: function (req, file, cb) {
    //By using file we get access of all the files that we do not get in express
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

export const upload = multer({
  storage
});
