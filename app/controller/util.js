'use strict';

const BaseController = require('./base');
const svgCaptcha = require('svg-captcha');
const fsextra = require('fs-extra');
const path = require('path');
const qiniu = require('qiniu');
const fs = require('fs');
const sizeOf = require('image-size');

class UtilController extends BaseController {
  async getCaption() {
    const { ctx } = this;
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 5,
      width: 100,
      height: 40,
    });
    ctx.session.captcha = captcha.text;
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
  }

  async sendcode() {
    const { ctx } = this;
    const { email } = ctx.request.query;
    // 取4位随机验证码
    const code = Math.random().toString().slice(2, 6);
    ctx.session.emailcode = code;

    const subject = 'qyuan验证码';
    const text = '';
    const html = `<h1>来自qyuan社区</h1><a href="#">${code}</a>`;

    const hasSend = await this.service.tools.sendMail(email, subject, text, html);
    if (hasSend) {
      this.message('邮箱验证码发送成功');
    } else {
      this.error('邮箱验证码发送失败');
    }
  }

  // 七牛token
  async qiniuToken() {
    const accessKey = 'opab2PsghpFhBKHSx98L1RdbXcj77UxNHWI5p0C1';
    const secretKey = 'Xg0OU1Ga40r__PZPx3mkFG9TofRbl0Xv_QYhzSMg';
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const options = {
      scope: 'qyuan', // 存储空间名字
      expires: 7200, // 有效期
      returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    this.success(uploadToken);
  }

  // 文件直接上传
  async updateSmailFile() {
    const { ctx } = this;
    const file = ctx.request.files[0];
    const { hash } = ctx.request.body;
    console.log(hash, file);
    // 将文件临时地址移动到目标地址
    const ext = file.filename.split('.').pop();
    const fileHashName = hash + '.' + ext;
    await fsextra.move(file.filepath, this.config.UPLOAD_DIR + '/' + fileHashName);
    // 个别需求：获取图片宽高 传递给前端
    const dimensions = sizeOf(`./app/public/${fileHashName}`);
    this.success({
      url: `/public/${fileHashName}`,
      height: dimensions.height,
      width: dimensions.width,
    });
  }

  // 切片上传
  async updateFile() {
    // 报错
    // if(Math.random() > 0.5){
    //   return this.ctx.status = 500
    // }
    const { ctx } = this;
    const file = ctx.request.files[0];
    const { name, hash } = ctx.request.body;
    console.log(name);
    // 以hash命名文件夹
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash);
    // 是否存在该文件夹，不存在创建
    if (!fsextra.existsSync(chunkPath)) {
      fsextra.mkdir(chunkPath);
    }
    // 移动chunk文件到hash文件夹下
    await fsextra.move(file.filepath, `${chunkPath}/${name}`);
    this.message('chunk上传成功');
  }

  // 合并文件
  async mergeFile() {
    const { ext, hash, size } = this.ctx.request.body;
    // 真实文件路径
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);
    await this.ctx.service.tools.mergeFile(filePath, hash, size);
    this.success({
      url: `/public/${hash}.${ext}`,
    });
  }

  /**
   * @summary 检查文件是否存在或存在的切片
   * @response {uploaded,uploadedList}
   */
  async checkfile() {
    const { ext, hash } = this.ctx.request.body;
    console.log(ext, hash);
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);
    // 文件已存在
    let uploaded = false;
    // 切片已存在
    let uploadedList = [];
    if (fsextra.existsSync(filePath)) {
      uploaded = true;
    } else {
      // 返回已上传的所有切片名字
      const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash);
      uploadedList = await this.getUploadedList(chunkPath);
    }
    this.success({
      uploaded,
      uploadedList,
    });
  }
  /**
   * @summary 返回已上传所有切片名字
   */
  async getUploadedList(dirPath) {
    return fsextra.existsSync(dirPath)
      ? (await fsextra.readdir(dirPath)).filter(name => name[0] !== '.') // 除去隐藏文件，其余切片都返回
      : []; // 文件夹不存在返回空
  }


  /**
   * 下载文件流
   */
  async download() {
    const filePath = path.resolve(__dirname, '../public/a0ce40201caca1835fdc86c3fe05a24f.jpg');
    // 创建读取流
    const readStream = fs.createReadStream(filePath);
    console.log('读取流', readStream);


    // // 写入
    // const writeStream = fs.createWriteStream(path.resolve(__dirname, '../public/1.jpg'));
    // // 管道流从输入定位到输出
    // readStream.pipe(writeStream);

    this.ctx.set('Content-Type', 'application/octet-stream');
    this.ctx.body = readStream;
  }
}

module.exports = UtilController;
