import type { Auth, Logger } from "@nw-union/nw-utils";
import { newAuthCloudflare } from "@nw-union/nw-utils/adapter/auth-cloudflare";
import { newAuthMock } from "@nw-union/nw-utils/adapter/auth-mock";
import { newLogConsole } from "@nw-union/nw-utils/adapter/log-console";
import { newLogJson } from "@nw-union/nw-utils/adapter/log-json";
import type { AppLoadContext } from "react-router";
import { match } from "ts-pattern";
import { newDocRepository } from "./adapter/drizzle/doc";
import type { DocRepositoryPort } from "./type";

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: Omit<ExecutionContext, "props">;
    };
    log: Logger;
    auth: Auth;
    repo: DocRepositoryPort;
  }
}

type GetLoadContextArgs = {
  request: Request;
  context: Pick<AppLoadContext, "cloudflare">;
};

export function getLoadContext({ context }: GetLoadContextArgs) {
  const { cloudflare } = context;
  const log = createLog(cloudflare.env);

  return {
    cloudflare,
    log,
    auth: createAuth(cloudflare.env),
    repo: newDocRepository(cloudflare.env.DB, log),
  };
}

// Dependency Injection --------------------------------------------------------
//
const createAuth = (env: CloudflareEnvironment): Auth =>
  match(env.AUTH_ADAPTER)
    .with("mock", () => newAuthMock())
    .with("cloudflare", () => newAuthCloudflare(env.AUTH_TEAM_DOMAIN))
    .exhaustive();

const createLog = (env: CloudflareEnvironment): Logger =>
  match(env.LOG_ADAPTER)
    .with("console", () => newLogConsole(env.LOG_LEVEL))
    .with("json", () => newLogJson(env.LOG_LEVEL))
    .exhaustive();
