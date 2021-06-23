const jwt = require('jsonwebtoken')

module.exports = ({app}) => {
    return async function verify(ctx,next){
        if (!ctx.request.header.authorization) {
            ctx.body = {
              code: -666,
              message: '用户没有登录',
            }
            return
        }
        const token = ctx.request.header.authorization.replace('Bearer ', '');
        try{
            //解码
            const res = await jwt.verify(token, app.config.jwt.secret)
            ctx.state.email = res.email
            ctx.state.userid = res.id
            await next()
        }catch(err){
            if (err.name === 'TokenExpiredError') {
                ctx.body = {
                  code: -666,
                  message: '登录过期了',
                }
              } else {
                ctx.body = {
                  code: -1,
                  message: '用户信息出错',
                }
              }
        }
    }
}