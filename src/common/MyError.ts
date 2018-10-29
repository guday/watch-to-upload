var util = require('util');


export class MyError extends Error {
  private code: string;
  private msg: string;
  private err: Error;

  constructor(code: string, msg: string | Object, err?: Error) {
    super();

    this.code = code;
    if (typeof(msg) === "string") {
      this.msg = <string>msg;
    } else {
      this.msg = util.inspect(msg);
    }

    this.err = err;
  }


  public static create(infoArr, err?: Error) {
    infoArr = infoArr || [];
    let code = infoArr[0] || "";
    let msg = infoArr[1] || "";

    return new MyError(code, msg, err);
  }

  public static createSystemError(code, obj) {
    return new MyError(code, obj);
  }

  public static createObjError(code, obj) {
    return new MyError(code, obj);
  }

  public getCode() {
    return this.code;
  }

  public getMsg() {
    return this.msg;
  }

  public getErr() {
    return this.err ? {
      message: this.err.message
    } : null
  }

}

export const ERR_MSG = {
  //common
  SYS_ERROR: ["0020", "系统错误"],
  PARAM_ERROR: ["0021", "参数错误"],
  CONFIG_ERROR: ["0022", "系统配置错误"],
  UNZIP_ERROR: ["0023", "解压失败"],
  RESTART_ERROR: ["0024", "重启失败"],

  //auth
  AUTH_PARAM: ["9005", "鉴权参数异常"],
  AUTH_DATA: ["0001", "鉴权数据异常"],
  AUTH_ESB_FAIL: ["9005", "ESB鉴权失败"],
  AUTH_DEVELOP_LIMIT: ["9005", "开发者只有查看权限"],
  AUTH_CONFIG_PARAM_FAIL: ["0041", "无此权限"],
  LOGIN_SESSION_DESTORY_FAIL: ["0003", "登出时session清理失败"],


  TABLE_QUERY_EMPTY1: ["9005", "查询鉴权数据异常1"],
  TABLE_QUERY_EMPTY2: ["9005", "查询鉴权数据异常2"],
  TABLE_QUERY_EMPTY3: ["9005", "查询鉴权数据异常3"],
  TABLE_QUERY_EMPTY4: ["9005", "查询鉴权数据异常4"],
  TABLE_UPDATE_ERROR: ["9005", "更新数据出错"],


  //double check
  NO_DOUBLE_CHECK: ["0041", "无复核权限"],
  NO_DOUBLE_CHECK1: ["0041", "然而，你不能复核，考虑下联系管理员，将你加入复核权限组"],
  NO_DOUBLE_CHECK2: ["0041", "复核的意义是多人复核，不允许即是你操作又是你复核，再找个人来"],

  //operate
  CONFIG_FILE_FAIL: ["0201", "配置文件获取失败"],
  RET_DATA_ERR: ["0202", "数据返回错误"],



}

export const SYSTEM_ERR = {
  GET_CONNECT: "1001",
  SQL_QUERY: "1002",
  SQL_BUILD: "1003",
}

export const COMMON_ERR = {
  GET_CONNECT: "2001",
  SQL_QUERY: "2002",
  SQL_BUILD: "2003",
}
