
const sharp = require("sharp");
const { file, resolve, find, savefile, mkdir, exists } = require("../tools/file");
const { resizeAndSave } = require("../tools/image");

module.exports = {
  makeios,
  makeAndroid,
}


let iconConfig = [
  iosLogo(1024, 1, '@1x'),
  iosLogo(83.5, 2),
  iosLogo(76, 2),
  iosLogo(76, 1, '@1x'),
  iosLogo(60, 3),
  iosLogo(60, 2),
  iosLogo(40, 3),
  iosLogo(40, 2),
  iosLogo(40, 1, '@1x'),
  iosLogo(29, 3),
  iosLogo(29, 2),
  iosLogo(29, 1, '@1x'),
  iosLogo(20, 3),
  iosLogo(20, 2),
  iosLogo(20, 1, '@1x'),
]

function iosLogo(truesize, delta, sufix = "") {
  let fileName = `Icon-App-${truesize}x${truesize}` + ((delta > 1) ? `@${delta}x` : '') + sufix + ".png";
  return {
    size: truesize * delta,
    fileName: fileName,
  }
}

function androidConfig() {
  return [
    {
      size: 48,
      name: "mipmap-mdpi",
    },
    {
      size: 72,
      name: "mipmap-hdpi",
    },
    {
      size: 96,
      name: "mipmap-xdpi",
    },
    {
      size: 144,
      name: "mipmap-xxdpi",
    },
    {
      size: 192,
      name: "mipmap-xxxdpi",
    },
  ]
}

/**
 * 生成安卓图标
 * 
 */
async function makeAndroid(filePath, androidProject = process.cwd()) {
  if (!filePath) {
    console.log("需要指定源文件");
    return;
  }
  let isAndroid = await exists(`${androidProject}/build.gradle`);
  let androidAssetsPath;
  if (isAndroid) {
    console.log('当前目录是一个安卓项目')
    androidAssetsPath = `app/src/res`
  } else {
    console.log('当前目录似乎不是一个安卓项目目录，生成目录')
    androidAssetsPath = `android`
    await mkdir(`${androidProject}/${androidAssetsPath}/`);
  }
  let image = sharp(filePath);

  let square = await isSquare(image)
  if (!square) {
    console.error('\n错误:图标必须是正方形\n');
    return;
  }

  for (const config of androidConfig()) {
    console.log('生成Android图标', config);
    let fileName = `${androidProject}/${androidAssetsPath}/${config.name}/ic_launcher.png`
    await mkdir(`${androidProject}/${androidAssetsPath}/${config.name}/`)
    await resizeAndSave(image, config.size, fileName);
  }
}

/**
 * 生成iOS图标，可以指定项目目录，默认在当前目录寻找iOS项目
 * @param filePath 
 * @param iosProjectPath 
 */
async function makeios(filePath, iosProjectPath = process.cwd()) {
  if (!filePath) {
    console.log("需要指定源文件");
    return;
  }

  let iosProjectName = await findProjectName(iosProjectPath);

  let iosAssetsPath;
  if (iosProjectName) {
    iosAssetsPath = `${iosProjectName}/Assets.xcassets`
  } else {
    console.log('当前目录似乎不是一个iOS项目目录，生成目录Assets.xcassets')
    iosAssetsPath = `Assets.xcassets`
  }

  let image = sharp(filePath);

  let square = await isSquare(image)
  if (!square) {
    console.error('\n错误:iOS图标必须是正方形,且没有alpha通道!!!\n');
    return;
  }

  await mkdir(`${iosProjectPath}/${iosAssetsPath}`)
  await mkdir(`${iosProjectPath}/${iosAssetsPath}/AppIcon.appiconset`)
  let contents = await file(resolve("../assets/Contents.json"))
  await savefile(`${iosProjectPath}/${iosAssetsPath}/AppIcon.appiconset/Contents.json`, contents);
  for (const config of iconConfig) {
    console.log('生成iOS图标', config);
    await resizeAndSave(image, config.size, `${iosProjectPath}/${iosAssetsPath}/AppIcon.appiconset/${config.fileName}`)
  }
}

async function isSquare(image) {
  return new Promise((r, e) => {
    image.metadata((err, metadata) => {
      if (err) {
        r(false)
        return
      }
      if (metadata.width === metadata.height) {
        console.log(metadata);
        r(true);
        return
      }
      r(false);
    })
  })
}


async function findProjectName(path) {
  let pathList = await find(path);
  let iosProjectName = ''
  for (const file of pathList) {
    console.log(file);
    let name = file.substring(
      file.lastIndexOf("/") + 1,
      file.length,
    );
    if (name.indexOf('.xcodeproj') > 1) {
      iosProjectName = name.replace('.xcodeproj', '');
    }
  }
  return iosProjectName;
}


