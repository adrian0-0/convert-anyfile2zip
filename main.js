const express = require('express')
const fs = require('fs')
const admzip = require('adm-zip')
const multer = require('multer')
const path = require("path")

var dir = "public";
var subDirectory = "public/uploads";

const app = express()
const PORT = 3000

app.use(express.static("public"))

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    fs.mkdirSync(subDirectory);
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
},
});


var maxSize = 2000000
var compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});


app.get("/",(req,res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get('/compressfiles',(req,res) => {

    res.render("compressfiles");

})

app.post("/compressfiles", compressfilesupload.array("file", 100000), (req, res) => {
  var zip = new admzip();
  var outputFilePath = Date.now() + "output.zip";
  if (req.files) {
    req.files.forEach((file) => {
      console.log(file.path)
      zip.addLocalFile(file.path)
    });
    fs.writeFileSync(outputFilePath, zip.toBuffer());
    res.download(outputFilePath,(err) => {
      if(err){
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        });
        fs.unlinkSync(outputFilePath) 
      }

      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      });

      fs.unlinkSync(outputFilePath)
    })
  }
});


app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
