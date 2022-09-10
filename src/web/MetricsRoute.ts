import { Request, Response } from 'express';
import client from 'prom-client';
import EventSource from 'eventsource';
import { config } from '../utils/Configuration';

const register = new client.Registry();

register.setDefaultLabels({
  app: 'airhornbot',
});

const airhornTotalHistogram = new client.Gauge({
  name: 'airhorn_total',
  help: 'The total usages of Airhorn.',
  labelNames: ['total'] as const,
});

const airhornUniqueUsersHistogram = new client.Gauge({
  name: 'airhorn_unique_users',
  help: 'The total unique users for Airhorn.',
  labelNames: ['unique_users'] as const,
});

const airhornUniqueGuildsHistogram = new client.Gauge({
  name: 'airhorn_unique_guilds',
  help: 'The total unique guilds for Airhorn.',
  labelNames: ['unique_guilds'] as const,
});

const airhornUniqueChannelsHistogram = new client.Gauge({
  name: 'airhorn_unique_channels',
  help: 'The total unique channels for Airhorn.',
  labelNames: ['unique_channels'] as const,
});

setInterval(() => {
  const airhornEventSource = new EventSource(config.settings.airhornBotApi + '/events');

  airhornEventSource.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    airhornTotalHistogram.set(Number(data.total) || 0);
    airhornUniqueUsersHistogram.set(Number(data.unique_users) || 0);
    airhornUniqueGuildsHistogram.set(Number(data.unique_guilds) || 0);
    airhornUniqueChannelsHistogram.set(Number(data.unique_channels) || 0);
  };

  airhornEventSource.onerror = (event: MessageEvent) => {
    console.dir(event);
  };

  setTimeout(() => {
    airhornEventSource.close();
  }, 27 * 1000);
}, 30 * 1000);

register.registerMetric(airhornTotalHistogram);
register.registerMetric(airhornUniqueUsersHistogram);
register.registerMetric(airhornUniqueGuildsHistogram);
register.registerMetric(airhornUniqueChannelsHistogram);

export async function metricsRouteHandler(req: Request, res: Response): Promise<void> {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics()).end();
}
