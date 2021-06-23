module.exports = {
    dbOptions: {
      database: "qyuan_framework",
      username: "root",
      password: "root",
      dialect: "mysql",
      host: "localhost",
      port: 3306,
      logging: false
    },
    options: {
      type: "egg",
      dir: "./app/model"
   }
  }