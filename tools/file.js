const fs = require("fs");
const join = require("path").join;

function file(path) {
  // console.log("read file:", path);
  return new Promise((r, e) => {
    fs.readFile(path, "utf8", async function(err, data) {
      if (!err) {
        r(data);
      } else {
        console.error("read file error", err);
        e(err);
      }
    });
  });
}

// 查找所有文件
function find(startPath) {
  let result = [];
  function finder(path) {
    let files = fs.readdirSync(path);
    files.forEach((val, index) => {
      let fPath = join(path, val);
      let stats = fs.statSync(fPath);
      if (stats.isDirectory()) finder(fPath);
      if (stats.isFile()) result.push(fPath);
    });
  }
  finder(startPath);
  return result;
}

function savefile(path, content) {
  console.log("保存文件", path);
  return new Promise((r, e) => {
    fs.writeFile(path, content, {}, async function(err) {
      if (!err) {
        r();
      } else {
        console.error("save file error", err);
        e(err);
      }
    });
  });
}

function mkdir(path) {
  return new Promise((r, e) => {
    fs.mkdir(path, async function(err) {
      r();
    });
  });
}

function resolve(dir) {
    return join(__dirname, dir);
}

module.exports = {
  find,
  file,
  savefile,
  mkdir,
  resolve,
};
