
const sharp = require("sharp");
const { file, resolve, find, savefile, mkdir } = require("../tools/file");
const path = require("path");
const { resizeAndSave } = require("../tools/image");

module.exports = {
  makeios,
}

/// 当前执行命令的路径
let execPath = process.cwd();

let iconConfig = [
  iosLogo(1024, 1),
  iosLogo(83.5, 2),
  iosLogo(76, 2),
  iosLogo(76, 1),
  iosLogo(72, 2),
  iosLogo(72, 1),
  iosLogo(60, 3),
  iosLogo(57, 2),
  iosLogo(57, 1),
  iosLogo(50, 2),
  iosLogo(50, 1),
  iosLogo(40, 3),
  iosLogo(40, 2),
  iosLogo(40, 1),
  iosLogo(29, 3),
  iosLogo(29, 2),
  iosLogo(29, 2, "-ipad"),
  iosLogo(29, 1),
  iosLogo(29, 1, "-ipad"),
  iosLogo(20, 3),
  iosLogo(20, 2),
  iosLogo(20, 2, "-ipad"),
  iosLogo(20, 1, "-ipad"),
]



function iosLogo(truesize, delta, sufix = "") {
  let fileName = `icon-${truesize}` + ((delta > 1) ? `@${delta}x` : '') + sufix + ".png";
  return {
    size: truesize * delta,
    fileName: fileName,
  }
}


async function makeios(filePath) {
  if (!filePath) {
    filePath = `${execPath}/ios_icon.png`
    console.log(`默认指定文件：${filePath}`)
  }
  let image = sharp(filePath);
  await mkdir(`${execPath}/Assets.xcassets`)
  await mkdir(`${execPath}/Assets.xcassets/AppIcon.appiconset`)
  // console.log('mkdir')
  let contents = await file(resolve("../assets/Contents.json"))
  // console.log('read')
  await savefile(`${execPath}/Assets.xcassets/AppIcon.appiconset/Contents.json`, contents);
  for (const config of iconConfig) {
    console.log(config);
    await resizeAndSave(image, config.size, `${execPath}/Assets.xcassets/AppIcon.appiconset/${config.fileName}`)
  }
}


