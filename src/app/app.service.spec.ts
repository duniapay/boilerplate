import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AppController } from 'src/app/app.controller';
import { AppService } from 'src/app/app.service';

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

const ConfigServiceProvider = {
  provide: ConfigService,
  useFactory: () => mockedConfigService,
};

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [ConfigServiceProvider, AppService],
    }).compile();

    appService = moduleRef.get<AppService>(AppService);
    appController = moduleRef.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should pass', async () => {
      const result = 'test';
      jest.spyOn(appService, 'root').mockImplementation(() => result);

      expect(await appController.root()).toBe(result);
    });
  });
});
