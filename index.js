#!/usr/bin/env node

const exec = require("child_process").exec;
const fs = require("fs");
const { program } = require("commander");
const { join } = require("path");

const { makeios, makeAndroid } = require("./builder/ios");
const { makeScreenshot } = require("./builder/screenshot");
const {
  initFlutter,
  makeFolder,
  makeflutter,
  makePreview,
  make,
} = require("./builder/flutter");

/** 初始化项目 */
const init = program.command("init");
init
  .description(
    "在一个Flutter项目中初始化tmaker，为你创建文件夹，添加示例文件和添加.gitignore参数"
  )
  .action(async (_, __) => {
    console.log("为你添加一些示例图片");
    initFlutter();
  });

/** 创建项目 */
program
  .command("build [parts]")
  .description(
    "创建资源，可指定创建指定部分，例: fmaker build ios,android,assets"
  )
  .action(async (parts, __) => {
    console.log("创建flutter资源", parts);
    var partList = (parts || "").split(",").filter((e) => !!e);
    if (partList.length == 0) partList = ["ios", "android", "assets"];
    await makeflutter(process.cwd(), {
      ios: !!~partList.indexOf("ios"),
      android: !!~partList.indexOf("android"),
      assets: !!~partList.indexOf("assets"),
    });
    console.log("\nflutter资源全部创建完成\n");
  });

/** 仅创建图片预览 */
program
  .command("preview")
  .description("仅创建资源的预览注释，也就是r.preview.dart文件")
  .action(async (_, __) => {
    console.log("创建注释中");
    await makePreview(process.cwd());
    console.log("\n注释全部创建完成\n");
  });

/** 项目文件夹图标 */
const folder = program.command("folder");
folder
  .description("把app的图标渲染在本项目的文件夹上(仅mac)")
  .action(async (_, __) => {
    console.log("添加项目文件夹图标");
    await makeFolder();
    console.log("\n设置项目文件夹图标完成\n");
  });
// program.addCommand(folder);
/** 项目文件夹图标 */
const screenshot = program.command("screenshot");
screenshot
  .description("处理当前文件夹下的截图，处理成Apple的标准尺寸")
  .action(async (_, __) => {
    console.log("开始处理截图");
    await makeScreenshot();
    console.log("\n处理截图完成\n");
  });

// 设置版本
program.version("2.0.0");
// program.option("-i", "生成iOS图标");
// program.option("-a", "生成安卓图标");
// program.option("-p", "生成资源");

program.parse(process.argv);
