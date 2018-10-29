import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as errorHandler from "errorhandler";
var skipper = require('skipper');

import {configure} from 'log4js';

import {IndexRoute} from "./routes/index";

var baseDir = __dirname;

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;


  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  public static setBaseDir(strPath: string) {
    baseDir = strPath
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add routes
    this.routes();

    //add api
    this.api();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    //empty for now
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //add static paths
    this.app.use(express.static(path.join(baseDir, "public")));

    //configure pug
    this.app.set("views", path.join(baseDir, "views"));
    this.app.set("view engine", "pug");

    //mount logger
    logger.format('request', '[request] :method :url :status');
    this.app.use(logger(<any>"request"));

    //mount json form parser
    this.app.use(bodyParser.json());

    //mount query string parser
    this.app.use(bodyParser.urlencoded({
      extended: false
    }));



    this.app.use(require('skipper')());

    //mount cookie parser middleware
    this.app.use(cookieParser());

    // catch 404 and forward to error handler
    this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404;
      next(err);
    });

    //error handling
    this.app.use(<any>errorHandler());


    //1. config log
    let errorFile: string = './log';


    configure(<any>{
      appenders: {
        console: {type: 'console'},
        error: {
          type: 'dateFile',
          filename: errorFile,
          pattern: '-yyyy-MM-dd.log',
          alwaysIncludePattern: true,
          maxLogSize: 1024000,
          backups: 10
        }
      },
      categories: {default: {appenders: ['console', 'error'], level: 'trace'}},

      pm2: true,
      replaceConsole: true
    });

  }

  /**
   * Create and return Router.
   *
   * @class Server
   * @method routes
   * @return void
   */
  private routes() {


    //use router middleware
    this.app.use('/', IndexRoute.create());
  }

}
