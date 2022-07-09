import multer from "multer";
import path from "path";

const multerSetup = (destination: string): multer.Multer => {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      // console.log(file);
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });
  const upload = multer({
    storage: storage,
    // fileFilter: function (_req, file, cb) {
    //   checkFileType(file, cb); //check array if it exists
    // },
  });
  return upload;
};

export function uploadSingle(name: string, destination: string) {
  const upload = multerSetup(destination);
  return upload.single(name);
}

export function uploadMultiple(
  name: string,
  amount: number,
  destination: string
) {
  const upload = multerSetup(destination);
  return upload.array(name, amount);
}

//CHNL cb type
function checkFileType(file: Express.Multer.File, cb: any) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
