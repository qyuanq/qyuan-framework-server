'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt({ app });

  router.get('/', controller.home.index);

  // 验证码
  router.get('/caption', controller.util.getCaption);

  // 邮箱验证码
  router.get('/sendcode', controller.util.sendcode);

  // 七牛token
  router.get('/qiniuToken', controller.util.qiniuToken);

  // 小文件直接上传
  router.post('/updateSmailFile', controller.util.updateSmailFile);
  // 文件上传
  router.post('/updateFile', controller.util.updateFile);
  // 文件合并
  router.post('/mergeFile', controller.util.mergeFile);
  // 文件秒传续传
  router.post('/checkfile', controller.util.checkfile);
  // 文件下载返回文件流
  router.post('/download', controller.util.download);

  router.group({ name: 'user', prefix: '/user' }, router => {
    const { register, login, info } = controller.user;
    router.post('/register', register);
    router.post('/login', login);
    router.get('/info', jwt, info);
  });
};
