import * as http from 'http';
import express, { Application, Request, Response } from 'express';
import { config } from './utils/Configuration';
import { metricsRouteHandler } from './web/MetricsRoute';

export class AirhornWeb {
  public readonly expressApplication: Application;
  public readonly httpServer: http.Server;

  constructor() {
    this.expressApplication = express();
    this.expressApplication.disable('x-powered-by');
    this.httpServer = new http.Server(this.expressApplication);
    // Register the routes
    this.expressApplication.get('/metrics', metricsRouteHandler);
    // Send a 404 when the path is not found.
    this.expressApplication.use((req: Request, res: Response) => {
      res.status(404).header('content-type', 'text/plain').send('404: Not Found');
    });
  }

  async start(): Promise<void> {
    this.httpServer.listen(config.web.port, () => {
      console.log('Web server is now listening on ' + config.web.port);
    });
  }
}

(async () => {
  const airhornWeb = new AirhornWeb();
  try {
    await airhornWeb.start();
  } catch (e) {
    console.error(e);
  }
})();
