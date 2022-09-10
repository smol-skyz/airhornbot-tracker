import { readFileSync } from 'fs';

interface Configuration {
  web: {
    port: number;
  };

  settings: {
    airhornBotApi: string;
  };
}

export const config: Configuration = JSON.parse(readFileSync('./config.json').toString());
