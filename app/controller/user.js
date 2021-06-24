const md5 = require('md5');
const jwt = require('jsonwebtoken');
const BaseController = require('./base');

// 加密随机数
const HashSalt = 'dakfjdsafi5512';
// 定义参数校验规则
const createRule = {
  email: { type: 'email' },
  name: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
};
class UserController extends BaseController {

  async register() {
    const { ctx } = this;
    // 校验传递的参数
    try {
      ctx.validate(createRule);
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors);
    }
    const { email, name, password, captcha } = ctx.request.body;
    // 校验验证码
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误');
    }
    // 验证邮箱是否重复
    if (await this.checkEmail(email)) {
      return this.error('邮箱已注册');
    }
    const res = await ctx.model.UserModel.create({
      email,
      name,
      password: md5(password + HashSalt),
    });
    console.log(res);
    if (res.id) {
      this.message('注册成功');
    } else {
      this.error('注册失败');
    }

  }

  async checkEmail(email) {
    const UserModel = await this.ctx.model.UserModel.findOne({
      where: { email },
      attributes: [ 'name', 'email' ],
    });
    return UserModel;
  }

  async login() {
    const { ctx, app } = this;
    const { email, password, captcha, emailcode } = ctx.request.body;

    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误');
    }

    if (emailcode !== ctx.session.emailcode) {
      return this.error('邮箱验证码错误');
    }

    const res = await ctx.model.UserModel.findOne({
      where: {
        email,
        password: md5(password + HashSalt),
      },
    });
    if (!res) {
      return this.error('用户名或密码错误');
    }

    // 登录成功生成token
    const token = jwt.sign(
      {
        id: res.id,
        email,
      },
      app.config.jwt.secret,
      {
        expiresIn: 7 * 24 * 3600 * 1000,
      }
    );
    console.log(token);
    this.success({ token });
  }

  async info() {
    const { ctx } = this;
    const email = ctx.state.email;
    const res = await this.checkEmail(email);
    this.success(res);
  }

  // 添加角色
  async role() {
    //   const {}
  }
}

module.exports = UserController;
