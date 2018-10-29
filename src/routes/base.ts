import {NextFunction, Response} from "express";
import {Request} from "../interface/ICommon"
// var Promise = require('bluebird');

var util = require('util');
var Log4js = require("log4js");
var LoggerRes = Log4js.getLogger("Res");
var LoggerReq = Log4js.getLogger("Req");
const SYSTEM_CODE = "8888"

import {MyError} from "../common/MyError"

interface Options {
  code: string,
  msg: string,
  data: any
}

interface CommonRsp {
  retCode: string,
  retMsg: string,
  retData: Object
}

/**
 * Constructor
 *
 * @class BaseRoute
 */
export class BaseRoute {

  /**
   * Constructor
   *
   * @class BaseRoute
   * @constructor
   */
  constructor() {

  }

  /**
   * 调试请求
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {Object} options
   */
  public debugRequest(req: Request, res: Response, next: NextFunction) {
    // LoggerReq.info("debugReq:", `query: ${util.inspect(req.query)}`);
    next();
  }

  /* 返回一个json结构
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {Object} options
 */
  public jsonReturn(retPromise: Promise<any>, req: Request, res: Response, next: NextFunction) {
    retPromise.then(info => {
      let str = util.inspect(info) || "";
      LoggerRes.info("success", str.substr(0, 100) + "...");
      let commonRsp: CommonRsp = {
        retCode: SYSTEM_CODE + "0000",
        retMsg: "",
        retData: info
      };
      res.json(commonRsp);

    }).catch((err: MyError) => {
        LoggerRes.info("fail", util.inspect(err), err && err.stack);

        let msg = err.getMsg && err.getMsg() || "";
        let code = err.getCode && err.getCode() || "9999";

        let commonRsp: CommonRsp = {
          retCode: SYSTEM_CODE + code,
          retMsg: msg,
          retData: err.getErr()
        };
        res.json(commonRsp);
      }
    )

    LoggerReq.info("jsonRsp:");
  }
}
