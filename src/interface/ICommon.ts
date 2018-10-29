import * as express from "express";

interface UserCookie extends express.CookieOptions {
  _expires: string
}

interface UserSession {
  id: string;
  cookie: UserCookie,
  e_name: string,
  c_name: string,
  destroy: Function
}

export interface Request extends express.Request {
  session: UserSession;
  file: Function
}


export interface SqlResultOperate {
  affectedRows: number
}

