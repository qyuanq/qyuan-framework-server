const Service = require('egg').Service;
const nodemailer = require('nodemailer');
const fsExtra = require('fs-extra');
const path = require('path');

const userEmail = 'qyuanjl@163.com';
const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'MSOAIEMHNSGHLFDO',
  },
});
class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    console.log;
    const mailOptions = {
      from: userEmail,
      cc: userEmail,
      to: email,
      subject,
      text,
      html,
    };
    try {
      transporter.sendMail(mailOptions);
      return true;
    } catch (e) {
      console.log('邮件出错', e);
      return false;
    }
  }

  /**
     *
     * @param {*} filePath 合并文件的真实路径
     * @param {*} filehash 文件hash
     * @param {*} size     切片大小
     */
  async mergeFile(filePath, filehash, size) {
    // 存放chunk文件夹
    const chunksDir = path.resolve(this.config.UPLOAD_DIR, filehash);
    // 读取文件夹获取所有chunk切片
    let chunks = await fsExtra.readdir(chunksDir);
    // 正序排序
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
    // chunks每一项的完整路径
    chunks = chunks.map(cp => path.resolve(chunksDir, cp));
    await this.mergeChunks(chunks, filePath, size);
  }

  /**
     *
     * @param {*} chunks 所有切片文件
     * @param {*} filePath 目标合并文件路径
     * @param {*} size  切片大小
     */
  async mergeChunks(files, dest, size) {
    const pipStream = (filePath, writeStream) =>
      new Promise(resolve => {
        // 读这个文件
        const readStream = fsExtra.createReadStream(filePath);
        // 读完
        readStream.on('end', () => {
          // 删除这个文件
          fsExtra.unlinkSync(filePath);
          resolve();
        });
        readStream.pipe(writeStream);
      });

    // Promise.all([])
    await Promise.all(
      files.forEach((file, index) => {
        pipStream(file, fsExtra.createWriteStream(dest, {
          start: index * size,
          end: (index + 1) * size,
        }));
      })
    );
  }

}

module.exports = ToolService;
