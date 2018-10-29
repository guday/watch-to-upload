import {NextFunction, Request, Response, Router} from "express";
import {BaseRoute} from "./base";
import * as express from "express";
import {CUpload} from "../controller/CUpload";

var Log = require("log4js").getLogger("[index]");
let router: express.Router;
router = express.Router();

/**
 * / route
 *
 * @class IndexRoute
 */
export class IndexRoute extends BaseRoute {

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create() {

    //log
    Log.debug("Creating route")
    let baseRoute = new BaseRoute();
    let cUpload = new CUpload();

    //登陆
    router.post("/upload", baseRoute.debugRequest, cUpload.operate.bind(cUpload), baseRoute.jsonReturn);
    //登陆
    router.get("/test", baseRoute.debugRequest, cUpload.test.bind(cUpload), baseRoute.jsonReturn);


    return router;
  }

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor() {
    super();
  }


}
