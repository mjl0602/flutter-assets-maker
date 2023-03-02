const fs = require("fs");
const sharp = require("sharp");

async function makeScreenshot() {
  const path = process.cwd();
  var files = fs.readdirSync(path);
  for (const fileName of files) {
    if (!fileName.endsWith(".PNG")) continue;
    let image = sharp(`${path}/${fileName}`);
    const size = await sizeOf(image);
    const radio = size.height / size.width;
    if (radio > 2) {
      // iPhone x 1242*2688
      await resizeAndSave(image, [1242, 2688], `${path}/ipxs(1242*2688)/${fileName}`);
    } else {
      // iPhone 6s 1242*2208
      await resizeAndSave(image, [1242, 2208], `${path}/ip6s(1242*2208)/${fileName}`);
    }
    console.log(fileName, size, radio);
  }
}

async function sizeOf(image) {
  return new Promise((r, e) => {
    image.metadata((err, metadata) => {
      if (err) {
        r(undefined);
        return;
      }
      r({
        width: metadata.width,
        height: metadata.height,
      });
    });
  });
}

function resizeAndSave(image, size, fileName) {
  // console.log("resizeAndSave", fileName);
  var targetPath = fileName.split("/");
  targetPath.pop();
  targetPath = targetPath.join("/");
  fs.mkdirSync(targetPath, {
    recursive: true,
  });
  return new Promise((r, e) => {
    image.resize(size[0], size[1]).toFile(fileName, (err, info) => {
      err ? e(err) : r(info);
    });
  });
}

module.exports = {
  makeScreenshot,
};
