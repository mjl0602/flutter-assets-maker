#!/usr/bin/env node
const sharp = require("sharp");

const fs = require("fs");
const join = require("path").join;
const path = require("path");


const { makeios,makeAndroid } = require("./builder/ios");
const { makeflutter,make } = require("./builder/flutter");

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
    console.log("安卓的命令还没写好");
    makeAndroid(args[3]);
    return;
  } else if (args[2] == "flutter") {
    console.log("创建flutter资源");
    makeflutter();
    return;
  }
  console.log("没对应指令", args[2]);
}






