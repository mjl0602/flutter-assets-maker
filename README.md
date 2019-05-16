> 在《浅谈Flutter的优缺点》文章中，我指出了Flutter存在切图困难，资源管理困难的缺陷，所以我使用node.js编写了一个小工具，可以帮您快速生成低倍率图片，并为iOS与安卓生成各自平台的图标。

## 提前全局安装
- flutter
- node.js环境
- npm包管理工具

# fmaker功能

fmaker是一个flutter辅助图片处理工具，也可以用来给iOS或Android项目生成图标

### 按倍率生成图片
`fmaker`可以自动识别项目下`/assets/fmaker`中的多倍图，将多倍图按flutter格式递归转换为2.0x，3.0x，4.0x等文件夹，再将压缩后的低倍图保存到assets中，保证flutter可以自动识别低倍率的图片。例如，在文件夹下放置`example@3x.png`，会生成三倍图，两倍图和一倍图。

> 为什么要这样做？  

因为高分辨率的图片被缩小时，会产生不必要的锐化效果，偶尔会产生卡顿；小图被放大时，会变得很模糊，flutter提供一个功能，自动显示正确分辨率的图片。
但是使用这个功能困难重重，如果你的设计使用sketch切图，只能切出`image.png`,`image@2x.png`,`image@3x.png`这种图，但是flutter需要的图片目录格式是`image.png`,`2.0x/image.png`,`3.0x/image.png`，这种格式使用sketch是很难一次导出的（需要每一次都更改导出名称），很不好用。

### 生成App图标

如果`/assets/fmaker`文件夹下有名为`ios_icon.png`和`android_icon.png`的文件，那么`fmaker`会自动识别这两个文件，直接将图标生成到项目中，不需要额外的复制粘贴。

> 注意：iOS的图标不可含有alpha通道，Android的图标可以包含。共同的一点是，图标必须是正方形，`fmaker`会帮你检查icon尺寸，并在log中输出错误。

# 安装

```bash
git clone https://github.com/mjl0602/flutter-assets-maker.git
cd flutter-assets-maker
npm install -g
fmaker
```
如果看到，“没有对应指令，fmaker已安装”的log，就已经安装成功。

# 使用
先假定你的项目名叫yourFlutterProject。

需要准备icon文件，`ios_icon.png`和`ios_android.png`，放在yourFlutterProject/assets/fmaker下，其他的多倍图也可以放进去，例如example@3x.png。

Tips:如果找不到合规的文件又想试一试，使用fmaker init来使用我的测试图片。

```bash
cd yourFlutterProject
fmaker init #如果暂时找不到图，就用我的图测试
fmaker build
```
然后安卓与iOS的App图标都已经被替换，你可以启动项目来查看。

# 注意

- 工具理论上只支持png。
- 工具会产生两个一样的图，一个是最高倍图，一个是源图，一定程度上增加了项目大小。
- 建议不要引用fmaker文件夹中的源图，因为他不能被自动切换倍率。
- fmaker的重复图片不会增加项目大小，只要你不引入源图。

# 示例

//TODO
有空就整个例子

> 如果有bug，欢迎提issue，pr更好哦。
> 仓库地址:https://github.com/mjl0602/flutter-assets-maker

#未经作者授权，本文禁止转载


