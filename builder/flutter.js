const sharp = require("sharp");
const fs = require("fs");
const {
  file,
  resolve,
  find,
  savefile,
  mkdir,
  exists,
  copyFile,
} = require("../tools/file");
const { resizeAndSave, deltaOf } = require("../tools/image");
const { makeios, makeAndroid } = require("./ios");
module.exports = {
  initFlutter,
  makeflutter,
  make,
  makeFolder,
};

async function initFlutter(flutterProjectPath = process.cwd()) {
  await mkdir(`${flutterProjectPath}/assets`);
  await mkdir(`${flutterProjectPath}/assets/fmaker`);

  let android = `${flutterProjectPath}/assets/fmaker/android_icon.png`;
  let ios = `${flutterProjectPath}/assets/fmaker/ios_icon.png`;
  let img = `${flutterProjectPath}/assets/fmaker/example@3x.png`;

  await copyFile(resolve("../assets/ic_launcher.png"), android);
  await copyFile(resolve("../assets/ios.png"), ios);
  await copyFile(resolve("../assets/example@3x.png"), img);

  console.log(
    `已经增加示例资源:${android},\n${ios},\n${img}\n查看这些文件，最好替换他们,再来试试 fmaker build`
  );
}

const execSync = require('child_process').execSync

/// 创建图标
async function makeFolder(flutterProjectPath = process.cwd()) {
  let isFlutter = await exists(`${flutterProjectPath}/pubspec.yaml`);
  if (!isFlutter) {
    console.log(
      `${flutterProjectPath}/pubspec.yaml 不存在`,
      "你必须在flutter目录下运行"
    );
    return false;
  }
  let hasIcon = await exists(`${flutterProjectPath}/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png`);
  if (!hasIcon) {
    console.log(
      `ios icon 不存在`,
      "必须在flutter工程下运行，fmaker将自动获取iOS项目下的图标"
    );
    return false;
  }

  // 设置图标的脚本的位置
  var shellPath = resolve("../assets/fileicon");

  // 定义
  var size = 256;
  var iconSize = 120;
  var muti = 2;
  // 图包素材
  var folderIcon = sharp(resolve("../assets/folder.png")).resize(size * muti, size * muti);
  var rawIcon = sharp(
    `${flutterProjectPath}/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png`
  ).resize(iconSize * muti, iconSize * muti);

  var iconShape = sharp(resolve("../assets/shape.png"));
  var iconBack = sharp(resolve("../assets/back.png"));


  var icon = iconShape.resize(iconSize * muti, iconSize * muti).composite([{
    input: await rawIcon.toBuffer(),
    left: 0,
    top: 0,
    blend: "in"
  }])
  // var result = await icon.toBuffer();
  var result = await folderIcon.composite([
    {
      input: await iconBack.resize(128 * muti, 128 * muti).toBuffer(),
      top: 71 * muti,
      left: 64 * muti,
    },
    {
      input: await icon.toBuffer(),
      top: 75 * muti,
      left: 68 * muti,
    },
  ]).toBuffer();

  var targetFilePath = `${flutterProjectPath}/_icon.png`;
  await savefile(targetFilePath, result);
  var res = execSync(`${shellPath} set ${flutterProjectPath} ${targetFilePath}`).toString();
  fs.rmSync(targetFilePath);
  console.log(res)
}

async function makeflutter(flutterProjectPath = process.cwd()) {
  let isFlutter = await exists(`${flutterProjectPath}/pubspec.yaml`);
  if (!isFlutter) {
    console.log(
      `${flutterProjectPath}/pubspec.yaml 不存在`,
      "你必须在flutter目录下运行"
    );
    return false;
  }
  let isInit = await exists(`${flutterProjectPath}/assets/fmaker`);
  if (!isInit) {
    await mkdir(`${flutterProjectPath}/assets`);
    await mkdir(`${flutterProjectPath}/assets/fmaker`);
  }
  let files = await find(`${flutterProjectPath}/assets/fmaker`);
  console.log("读取到文件", files);
  if (files.length == 0) {
    console.log("请先添加文件到fmaker目录");
  }
  var allFileName = [];
  for (const imgPath of files) {
    if (imgPath.indexOf(".png") < 1) {
      continue;
    }

    await make(imgPath, async (imageName, delta, isCheck) => {
      if (imageName == "ios_icon") {
        await makeios(imgPath, `${flutterProjectPath}/ios`);
        return "";
      }
      if (imageName == "android_icon") {
        await makeAndroid(imgPath, `${flutterProjectPath}/android`);
        return "";
      }
      if (delta == 1) {
        if (!isCheck) {
          console.log("创建资源图", imageName);
          allFileName.push(imageName);
        }
        return `${flutterProjectPath}/assets/${imageName}.png`;
      }
      await mkdir(`${flutterProjectPath}/assets/${delta}.0x/`);
      return `${flutterProjectPath}/assets/${delta}.0x/${imageName}.png`;
    });
  }
  console.log("资源目录：", allFileName);

  /// 保存到yaml
  var assetsListString = allFileName
    .map((name) => {
      return `    - assets/${name}.png`;
    })
    .join("\n");
  console.log(assetsListString);
  var replaceSuccess = replaceStringInFile(
    `${flutterProjectPath}/pubspec.yaml`,
    /(# fmaker)[\w\W]*(# fmaker-end)/g,
    "# fmaker\n    # fmaker-end"
  );
  var generateSuccess = replaceStringInFile(
    `${flutterProjectPath}/pubspec.yaml`,
    "# fmaker",
    "# fmaker\n" +
    assetsListString +
    (replaceSuccess ? "" : "\n    # fmaker-end")
  );

  if (!generateSuccess) {
    console.log(
      "\n在pubspec.yaml中没有找到生成标记，请添加‘# fmaker’标记！！\n"
    );
  }

  /// 保存到r.dart
  await mkdir(`${flutterProjectPath}/lib`);

  var rContentListString = allFileName
    .map((name) => {
      var dartName = toHump(name);
      return (
        `  /// ![](${flutterProjectPath}/assets/${name}.png)\n` +
        `  static final String ${dartName} = 'assets/${name}.png';`
      );
    })
    .join("\n");
  var rContent = `class R {\n${rContentListString}\n}`;
  fs.writeFileSync(`${flutterProjectPath}/lib/r.dart`, rContent);
}

// 下划线转换驼峰
function toHump(name) {
  return name.replace(/[\_\-\+:\(\)\[\] ](\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

function replaceStringInFile(file, target, replace) {
  var content = fs.readFileSync(file, { encoding: "UTF-8" });
  var newContent = content.replace(target, replace);
  fs.writeFileSync(file, newContent);
  return content != newContent;
}

// 生成一张图片的低倍率版本
async function make(filePath, filePathBuilder) {
  if (!filePathBuilder) {
    // 文件路径创建
    filePathBuilder = async (imageName, delta) => {
      console.log("采用默认生成");
      return `${process.cwd()}/${imageName}@${delta}x.png`;
    };
  }
  // 获取文件名
  let fileName = filePath.substring(
    filePath.lastIndexOf("/") + 1,
    filePath.length
  );

  let imageName = fileName.replace(/@(\S*)[Xx]/g, "").replace(/\.\S*$/, "");

  // 获取倍率
  let delta = deltaOf(filePath);
  console.log(`\n正在生成:${imageName} 倍率:${delta}`);
  // console.log("\n开始生成\n");
  let image = sharp(filePath);
  let metadata = await image.metadata();

  //先预先检查一下
  let precheck = await filePathBuilder(imageName, 1, true);
  if (!precheck) {
    return;
  }

  for (let i = delta; i > 0; i--) {
    let size = parseInt((metadata.width / delta) * i);
    let targetPath = await filePathBuilder(imageName, i);
    if (!targetPath) {
      console.log("中断生成");
      return;
    }
    // console.log("生成中");
    let info = await resizeAndSave(image, size, targetPath);
    // console.log(
    //   `已生成: ${imageName} ${i}倍图,尺寸：宽:${info.width} 高${info.height}`,
    // );
  }
}
