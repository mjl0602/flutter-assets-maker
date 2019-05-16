#!/usr/bin/env node
const sharp = require("sharp");

const fs = require("fs");
const join = require("path").join;
const path = require("path");

const { resizeAndSave, deltaOf } = require("./tools/image");
const { makeios } = require("./builder/ios");
/// 当前执行命令的路径
let execPath = process.cwd();

main(process.argv);

async function main(args) {
  console.log("args", args);
  if (!args[2]) {
    console.log("命令错误，请输入正确的命令格式");
    return;
  } else if (args[2] == "make") {
    console.log("正在通过指定文件创建");
    make(args[3]);
    return;
  } else if (args[2] == "ios") {
    console.log("正在创建iOS");
    makeios(args[3]);
    return;
  } else if (args[2] == "android") {
    console.log("正在创建Android");
    // makeios(args[3]);
    return;
  }
  console.log("没对应指令", args[2]);
}


// 生成一张图片的低倍率版本
async function make(filePath) {
  // 获取文件名
  let fileName = filePath.substring(
    filePath.lastIndexOf("/") + 1,
    filePath.length,
  );

  let imageName = fileName.replace(/@(\S*)[Xx]/g, "").replace(/\.\S*$/, "");

  // 获取倍率
  let delta = deltaOf(filePath);
  console.log("\n当前图片倍率", delta);
  console.log("\n开始生成\n");
  let image = sharp(filePath);
  let metadata = await image.metadata();
  let size = parseInt((metadata.width / delta) * i)
  for (let i = delta - 1; i > 0; i--) {
    let info = await resizeAndSave(
      image, size, `${execPath}/${imageName}@${i}x.png`,
    );
    console.log(
      `生成${imageName}的${i}倍图,尺寸：宽:${info.width} 高${info.height}`,
    );
  }
}



