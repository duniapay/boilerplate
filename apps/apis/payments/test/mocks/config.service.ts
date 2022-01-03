import { ConfigService } from '@nestjs/config';

const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_EXPIRATION_TIME':
        return '3600';
      case 'APP_URL':
        return 'localhost';
    }
  },
};

export const ConfigServiceProvider = {
  provide: ConfigService,
  useFactory: () => mockedConfigService,
};
