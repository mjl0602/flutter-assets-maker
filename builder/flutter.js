const sharp = require("sharp");
const { file, resolve, find, savefile, mkdir, exists } = require("../tools/file");
const { resizeAndSave, deltaOf } = require("../tools/image");
const { makeios, makeAndroid } = require("./ios");
module.exports = {
  makeflutter,
  make,
}

async function makeflutter(flutterProjectPath = process.cwd()) {
  let isFlutter = await exists(`${flutterProjectPath}/pubspec.yaml`);
  if (!isFlutter) {
    console.log(`${flutterProjectPath}/pubspec.yaml 不存在`, '你必须在flutter目录下运行');
    return false;
  }
  let isInit = await exists(`${flutterProjectPath}/assets/fmaker`)
  if (!isInit) {
    await mkdir(`${flutterProjectPath}/assets`);
    await mkdir(`${flutterProjectPath}/assets/fmaker`);
  }
  let files = await find(`${flutterProjectPath}/assets/fmaker`);
  console.log('读取到文件', files);
  if (files.length == 0) {
    console.log("请先添加文件到fmaker目录");
  }

  for (const imgPath of files) {
    if (imgPath.indexOf('.png') < 1) {
      continue;
    }
    console.log('imgPath', imgPath);
    await make(imgPath, async (imageName, delta) => {
      console.log('make', imgPath, imageName);
      if (imageName == "ios_icon") {
        await makeios(imgPath, `${flutterProjectPath}/ios`);
        return '';
      }
      if (imageName == "android_icon") {
        await makeAndroid(imgPath, `${flutterProjectPath}/android`);
        return '';
      }

      if (delta == 1) {
        return `${flutterProjectPath}/assets/${imageName}.png`
      }
      await mkdir(`${flutterProjectPath}/assets/${delta}x/`);
      return `${flutterProjectPath}/assets/${delta}x/${imageName}.png`
    });
  }

}


// 生成一张图片的低倍率版本
async function make(filePath, filePathBuilder) {
  if (!filePathBuilder) {
    // 文件路径创建
    filePathBuilder = async (imageName, delta) => {
      console.log('采用默认生成');
      return `${process.cwd()}/${imageName}@${delta}x.png`
    }
  }
  // 获取文件名
  let fileName = filePath.substring(
    filePath.lastIndexOf("/") + 1,
    filePath.length,
  );

  let imageName = fileName.replace(/@(\S*)[Xx]/g, "").replace(/\.\S*$/, "");

  // 获取倍率
  let delta = deltaOf(filePath);
  console.log("\n当前图片倍率", delta, imageName);
  console.log("\n开始生成\n");
  let image = sharp(filePath);
  let metadata = await image.metadata();

  //先预先检查一下
  let precheck = filePathBuilder(imageName, 1);
  if (!precheck) {
    return;
  }

  for (let i = delta; i > 0; i--) {
    let size = parseInt((metadata.width / delta) * i);
    let targetPath = await filePathBuilder(imageName, i);
    if (!targetPath) {
      console.log('中断生成')
      return;
    }
    console.log('生成中')
    let info = await resizeAndSave(
      image, size, targetPath,
    );
    console.log(
      `生成${imageName}的${i}倍图,尺寸：宽:${info.width} 高${info.height}`,
    );
  }
}


