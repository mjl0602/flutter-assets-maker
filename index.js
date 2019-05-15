#!/usr/bin/env node

const sharp = require("sharp");

const fs = require("fs");
const join = require("path").join;

// 当前执行命令的路径
let execPath = process.cwd();

main(process.argv);

async function main(args) {
  console.log("args", args);
  if (!args[2]) {
    console.log("命令错误，请输入正确的命令格式");
    return;
  } else if (args[2] == "init") {
    // console.log("初始化项目");
    // init(args[2]);
    return;
  } else if (args[2] == "make") {
    console.log("正在通过指定文件创建");
    make(args[3]);
    return;
  }
  console.log("没对应指令", args[2]);
}

async function makeDelta(filePath) {}

async function make(filePath) {
  // 获取文件名
  let fileName = filePath.substring(
    filePath.lastIndexOf("/") + 1,
    filePath.length,
  );

  let imageName = fileName.replace(/@(\S*)[Xx]/g, "").replace(/\.\S*$/, "");

  // 获取倍率
  let delta = deltaOf(filePath);
  console.log("\n提取图片倍率", delta);

  console.log("\n开始生成\n");

  let image = sharp(filePath);
  let metadata = await image.metadata();
  // console.log(metadata);
  for (let i = delta - 1; i > 0; i--) {
    let info = await resizeAndSave(
      image,
      parseInt((metadata.width / delta) * i),
      `${execPath}/${imageName}@${i}x.png`,
    );
    console.log(
      `生成${imageName}的${i}倍图,尺寸：宽:${info.width} 高${info.height}`,
    );
  }
}

function resizeAndSave(image, size, fileName) {
  return new Promise((r, e) => {
    image.resize(size).toFile(fileName, (err, info) => {
      err ? e(err) : r(info);
    });
  });
}

async function makeAll() {}

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

function deltaOf(name) {
  let result = name.match(/@(\S*)[Xx]/) || [];
  if (result.length <= 1) {
    return 0;
  }
  result = parseInt(result[1]);
  return result || 0;
}
