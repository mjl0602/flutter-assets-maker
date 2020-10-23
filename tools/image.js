const fs = require("fs");
let path = require("path");
module.exports = {
  resizeAndSave,
  deltaOf,
};

function resizeAndSave(image, size, fileName) {
  // console.log("resizeAndSave", fileName);
  var targetPath = fileName.split("/");
  targetPath.pop();
  targetPath = targetPath.join("/");
  fs.mkdirSync(targetPath, {
    recursive: true,
  });
  return new Promise((r, e) => {
    image.resize(size).toFile(fileName, (err, info) => {
      err ? e(err) : r(info);
    });
  });
}

// 从文件名获取倍率
function deltaOf(name) {
  let result = name.match(/@(\S*)[Xx]/) || [];
  if (result.length <= 1) {
    return 0;
  }
  result = parseInt(result[1]);
  return result || 0;
}
