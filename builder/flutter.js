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
  makePreview,
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

  var files = fs.readdirSync(`${flutterProjectPath}/assets/fmaker/`);
  if (files.length == 0) {
    console.log("添加示例图 example@3x.png");
    await copyFile(resolve("../assets/example@3x.png"), img);
  } else {
    console.log("fmaker文件夹非空，无需添加示例图");
  }

  await copyFile(resolve("../assets/ic_launcher.png"), android);
  await copyFile(resolve("../assets/ios.png"), ios);

  addIgnoreIfNeed();
  console.log(
    `已经增加示例资源:${android},\n${ios},\n${img}\n查看这些文件，最好替换他们,再来试试 fmaker build`
  );
}

function addIgnoreIfNeed() {
  // 处理.gitignore
  let cmdPath = process.cwd();
  console.log("\n检查 .gitignore");
  if (!fs.existsSync(`${cmdPath}/.gitignore`)) {
    // fs.writeFileSync(`${cmdPath}/.gitignore`, '');
    console.log("没有发现.gitignore文件，建议创建.gitignore文件");
    return;
  }
  let gitignore = fs.readFileSync(`${cmdPath}/.gitignore`, {
    encoding: "utf-8",
  });
  if (gitignore.indexOf("\nlib/r.preview.dart\n") == -1) {
    gitignore =
      gitignore + "\n\n# ignore assets preview file\nlib/r.preview.dart\n";
    fs.writeFileSync(`${cmdPath}/.gitignore`, gitignore);
    console.log(".gitignore 添加完成");
  } else {
    console.log("无需添加.gitignore");
  }
}

const execSync = require("child_process").execSync;

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
  let hasIcon = await exists(
    `${flutterProjectPath}/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png`
  );
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
  var folderIcon = sharp(resolve("../assets/folder.png")).resize(
    size * muti,
    size * muti
  );
  var rawIcon = sharp(
    `${flutterProjectPath}/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png`
  ).resize(iconSize * muti, iconSize * muti);

  var iconShape = sharp(resolve("../assets/shape.png"));
  var iconBack = sharp(resolve("../assets/back.png"));

  var icon = iconShape.resize(iconSize * muti, iconSize * muti).composite([
    {
      input: await rawIcon.toBuffer(),
      left: 0,
      top: 0,
      blend: "in",
    },
  ]);

  var result = await folderIcon
    .composite([
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
    ])
    .toBuffer();

  var targetFilePath = `${flutterProjectPath}/_icon.png`;
  console.log("生成图标中...");
  await savefile(targetFilePath, result);
  var res = execSync(
    `${shellPath} set ${flutterProjectPath} ${targetFilePath}`
  ).toString();
  console.log("正在设置图标:", res);
  console.log("图标设置成功");

  console.log("\n清理...");
  fs.rmSync(targetFilePath);
  console.log("清理完成");

  // 处理.gitignore
  console.log("\n尝试添加 .gitignore");
  let gitignore = fs.readFileSync(`${flutterProjectPath}/.gitignore`, {
    encoding: "utf-8",
  });
  // console.log(gitignore);
  if (gitignore.indexOf("\nIcon?\n") == -1) {
    gitignore = gitignore + "\n\n# fmaker folder icon\nIcon?\n";
    fs.writeFileSync(`${flutterProjectPath}/.gitignore`, gitignore);
    // console.log(gitignore);
    console.log(".gitignore 添加完成");
  } else {
    console.log("无需添加.gitignore");
  }
}

async function makeflutter(flutterProjectPath = process.cwd(), config) {
  var { ios: _makeIOS, android: _buildAndroid, assets: _makeAssets } = config;
  addIgnoreIfNeed();
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
  console.log(`读取到${files.length}个文件`);
  if (files.length == 0) {
    console.log("请先添加文件到fmaker目录");
  }
  var allAvaliableFiles = [];
  for (const imgPath of files) {
    if (imgPath.indexOf(".png") < 1) {
      continue;
    }

    await make(imgPath, async (imageName, delta, isCheck) => {
      if (imageName == "ios_icon" && !!_makeIOS) {
        await makeios(imgPath, `${flutterProjectPath}/ios`);
        return "";
      }
      if (imageName == "android_icon" && !!_buildAndroid) {
        await makeAndroid(imgPath, `${flutterProjectPath}/android`);
        return "";
      }
      if (delta == 1) {
        if (!isCheck) {
          // console.log("创建资源图", imageName);
          allAvaliableFiles.push({
            name: imageName,
            path: imgPath,
          });
        }
        return `${flutterProjectPath}/assets/${imageName}.png`;
      }
      if (!!_makeAssets)
        await mkdir(`${flutterProjectPath}/assets/${delta}.0x/`);
      return `${flutterProjectPath}/assets/${delta}.0x/${imageName}.png`;
    });
  }
  if (!_makeAssets) return;
  console.log("资源目录：", allAvaliableFiles);
  // 保存到yaml
  var assetsListString = allAvaliableFiles
    .map((img) => {
      return `    - assets/${img.name}.png`;
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

  var rContentListString = allAvaliableFiles
    .map((img) => {
      const name = img.name;
      var dartName = toHump(name);
      return (
        `  /// {@macro fmaker.${dartName}.preview}\n` +
        `  static final String ${dartName} = 'assets/${name}.png';`
      );
    })
    .join("\n");
  var rContent = `class R {\n${rContentListString}\n}`;
  fs.writeFileSync(`${flutterProjectPath}/lib/r.dart`, rContent);

  /// 保存到r.preview.dart
  var rPreviewContentListString = allAvaliableFiles
    .map((img) => {
      const name = img.name;
      var dartName = toHump(name);
      var stat = fs.statSync(`${img.path}`);
      var size = (stat.size / 1000).toFixed(1);
      return (
        `/// {@template fmaker.${dartName}.preview}\n` +
        `/// R.${dartName}(${size}kb): ![](${flutterProjectPath}/assets/${name}.png)  \n` +
        `/// \n` +
        `/// {@endtemplate}`
      );
    })
    .join("\n\n");
  var rPreviewContent = `${rPreviewContentListString} \n\n// ignore_for_file: camel_case_types, unused_element \nclass _ {}`;
  fs.writeFileSync(`${flutterProjectPath}/lib/r.preview.dart`, rPreviewContent);
}

async function makePreview() {
  var flutterProjectPath = process.cwd();
  addIgnoreIfNeed();
  let isFlutter = await exists(`${flutterProjectPath}/pubspec.yaml`);
  if (!isFlutter) {
    console.log(
      `${flutterProjectPath}/pubspec.yaml 不存在`,
      "你必须在flutter目录下运行"
    );
    return false;
  }
  let files = await find(`${flutterProjectPath}/assets/fmaker`);
  console.log(`读取到${files.length}个文件`);
  if (files.length == 0) {
    console.log("请先添加文件到fmaker目录");
    return;
  }
  var allFileName = [];
  for (const imgPath of files) {
    if (imgPath.indexOf(".png") < 1) {
      continue;
    }
    // 获取文件名
    let fileName = imgPath.substring(
      imgPath.lastIndexOf("/") + 1,
      imgPath.length
    );
    // 获取倍率
    let delta = deltaOf(imgPath);
    if (delta > 0) allFileName.push(fileName);
  }
  /// 保存到r.preview.dart
  var rPreviewContentListString = allFileName
    .map((name) => {
      var dartName = toHump(name);
      return (
        `/// {@template fmaker.${dartName}.preview}\n` +
        `/// ![](${flutterProjectPath}/assets/${name}.png)\n` +
        `/// {@endtemplate}`
      );
    })
    .join("\n\n");
  var rPreviewContent = `${rPreviewContentListString} \n\n// ignore_for_file: camel_case_types, unused_element \nclass _ {}`;
  fs.writeFileSync(`${flutterProjectPath}/lib/r.preview.dart`, rPreviewContent);
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
