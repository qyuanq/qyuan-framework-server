/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path')

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1622712530627_6648';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.multipart = {
    mode: 'file',
    whitelist: () => true,
    // fileSize: 1048576000
  }
  //全局变量：用于存储上传的文件
  config.UPLOAD_DIR = path.resolve(__dirname, '..', 'app/public')
  
  config.jwt = {
    secret:'qyuanappleid12300',
  };

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    database: 'qyuan_framework',
    username: 'root',
    password: 'root',
    define: {
      timestamps: false
    }
  };

  config.security = {
    csrf: {
      enable: false,
    }
  };

  return {
    ...config,
    ...userConfig,
  };
};
