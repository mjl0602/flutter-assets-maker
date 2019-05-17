#!/usr/bin/env node
const sharp = require("sharp");

const fs = require("fs");
const join = require("path").join;
const path = require("path");

// const { file, resolve, find, savefile, mkdir, exists } = require("../tools/file");

const { makeios, makeAndroid } = require("./builder/ios");
const { initFlutter, makeflutter, make } = require("./builder/flutter");

/// 当前执行命令的路径
let execPath = process.cwd();

main(process.argv);

async function main(args) {
  console.log("args", args);
  if (!args[2]) {
    console.log("命令错误，请输入正确的命令格式");
    // return;
  } else if (args[2] == "init") {
    console.log("为你添加一些示例图片");
    initFlutter();
    return;
  } else if (args[2] == "make") {
    console.log("正在通过指定文件创建低倍图");
    make(args[3]);
    return;
  } else if (args[2] == "ios") {
    console.log("单独创建iOS图标");
    makeios(args[3]);
    return;
  } else if (args[2] == "android") {
    console.log("单独创建安卓图标");
    makeAndroid(args[3]);
    return;
  } else if (args[2] == "build") {
    console.log("创建flutter资源");
    await makeflutter();
    console.log("\nflutter资源全部创建完成\n");
    return;
  }
  console.log("没有对应指令,fmaker已安装");
}







