# Clean architecture with Nestjs

## **1- Introduction**

What is clean architecture?
Clean architecture was created by **Robert C. Martin**. He is the author of a few books where you can understand his concept. But in our case, we will keep the focus on Clean Architecture.

![Alt](./assets/onion.png "Onion architecture")


Clean architecture is a software design philosophy that separates the elements of a design into ring levels. An important goal of clean architecture is to provide developers with a way to organize code in such a way that it encapsulates the business logic but keeps it separate from the delivery mechanism.

PS: I have added some SOLID code design principles because as it is an important part of clean architecture.


#### **Single responsibility principle** : 

A class should have one, and only one, reason to change. Or the new version: a module should be responsible to one, and only one, actor.

#### **Open-closed principle**: 

A class should be open for extension but closed for modification.
Liskov’s substitution principle: objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.

#### **Interface segregation principle** : 

Many client-specific interfaces are better than one general-purpose interface.

#### **Dependency inversion principle** : 

One should depend upon abstractions, not concretions.

## **2- Preparation**

Install nest CLI if you don’t have it already and create a new project

```nest generate app app-name```

Remove ***app.service.ts*** and ***app.controller.ts***

```cd apps && cd appname```

```cd src && rm -rf appname.controller.ts && rm -rf appname.service.ts```

Concretely, there are 3 main packages: ***domain***, ***usecases*** and ***infrastructure***. These packages have to respect these rules:
* **domain** contains the business code and its logic and has no outward dependency: nor on frameworks (NestJS in our case), nor on use_cases or infrastructure packages.

* **usecases** is like a conductor. It will depend only on domain package to execute business logic. use_cases should not have any dependencies on infrastructure (including framework or npm module).

* **infrastructure** contains all the technical details, configuration, implementations (database, web services, npm module, etc.), and must not contain any business logic. infrastructure has dependencies on domain, use_cases and frameworks.


Create the folders :

```mkdir domain && mkdir usecases && mkdir infrastructure```


![Alt](./assets/folders.png "DDD Folders")



## **3- Coding**
For this example, we will realize a basic todo list. I will be brief for many points because it is not essential and/or you can find better information directly inside Nestjs Doc. I will be more focused on the clean architecture principle.

### **Configuration**
Run the cmd to generate a new module and service. And don’t forget to install @nestjs/config

```nest g mo /infrastructure/config/environment-config```

```nest g s /infrastructure/config/environment-config```


Create an interface inside the folder domain.

```
export interface DatabaseConfig {
  getDatabaseHost(): string;
  getDatabasePort(): number;
  getDatabaseUser(): string;
  getDatabasePassword(): string;
  getDatabaseName(): string;
  getDatabaseSchema(): string;
  getDatabaseSync(): boolean;
}
```

And implement this interface inside the environment-config service.

```
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../../domain/config/database.interface';

@Injectable()
export class EnvironmentConfigService implements DatabaseConfig {
  constructor(private configService: ConfigService) {}

  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST');
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT');
  }

  getDatabaseUser(): string {
    return this.configService.get<string>('DATABASE_USER');
  }

  getDatabasePassword(): string {
    return this.configService.get<string>('DATABASE_PASSWORD');
  }

  getDatabaseName(): string {
    return this.configService.get<string>('DATABASE_NAME');
  }

  getDatabaseSchema(): string {
    return this.configService.get<string>('DATABASE_SCHEMA');
  }

  getDatabaseSync(): boolean {
    return this.configService.get<boolean>('DATABASE_SYNCHRONIZE');
  }
}
```

Create the configuration validation file `environment-config.validation.ts`

And implement the validation for the environment-config module.

```
import { plainToClass } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Local = 'local',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  DATABASE_HOST: string;
  @IsNumber()
  DATABASE_PORT: number;
  @IsString()
  DATABASE_USER: string;
  @IsString()
  DATABASE_PASSWORD: string;
  @IsString()
  DATABASE_NAME: string;
  @IsString()
  DATABASE_SCHEMA: string;
  @IsBoolean()
  DATABASE_SYNCHRONIZE: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
```
And implement this interface inside the environment-config module.

```
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentConfigService } from './environment-config.service';
import { validate } from './environment-config.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './env/local.env',
      ignoreEnvFile: process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test' ? false : true,
      isGlobal: true,
      validate,
    }),
  ],
  providers: [EnvironmentConfigService],
  exports: [EnvironmentConfigService],
})
export class EnvironmentConfigModule {}
```


Now we will implement Typeorm to be able to access the database.

```nest g mo /infrastructure/config/typeorm```

```
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

export const getTypeOrmModuleOptions = (config: EnvironmentConfigService): TypeOrmModuleOptions =>
  ({
    type: 'postgres',
    host: config.getDatabaseHost(),
    port: config.getDatabasePort(),
    username: config.getDatabaseUser(),
    password: config.getDatabasePassword(),
    database: config.getDatabaseName(),
    entities: [__dirname + './../../**/*.entity{.ts,.js}'],
    synchronize: false,
    schema: process.env.DATABASE_SCHEMA,
    ssl: {
      rejectUnauthorized: false,
    },
  } as TypeOrmModuleOptions);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvironmentConfigService],
      inject: [EnvironmentConfigService],
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}
```

And change the **start:dev** in the package.json
"start:dev": "NODE_ENV=local nest start --watch",
npm run start:dev

### **Entity**
The entities files are inside the infrastructure folder. The entity is a part of the infrastructure for the only reason it using the externals module.

```
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column('varchar', { length: 255, nullable: true })
  content: string;

  @Column('boolean', { default: false })
  isDone: boolean;

  @CreateDateColumn({ name: 'createdate' })
  createdate: Date;

  @UpdateDateColumn({ name: 'updateddate' })
  updateddate: Date;
}
```

Because the entities are inside the infrastructure, we need a model.

```

export class TodoM {
  id: number;
  content: string;
  isDone: boolean;
  createdate: Date;
  updateddate: Date;
}
```

In our case, we don’t need a constructor for this model, but it is a good place to modify your model.

### **Logger**

All applications are using a logger, there are plenty of loggers, for example, cloud providers (AWS, GCP, Azure, …) use different loggers. Moreover, changing a logger can be painful. It is for this reason, we are using a module with an interface to abstract this problem to our logic and be independent from the cloud provider or an npm module.


This is the interface inside the `libs/utils/src/common/domain` folder.

```
export interface ILogger {
    debug(context: string, message: string): void;
    log(context: string, message: string): void;
    error(context: string, message: string, trace?: string): void;
    warn(context: string, message: string): void;
    verbose(context: string, message: string): void;
}
```

And the service. In this example, We are using nest logger but with the abstraction, I can change easily in the future if it is needed.

```
import { Injectable, Logger } from '@nestjs/common';
import { ILogger } from '../../domain/logger/logger.interface';

@Injectable()
export class LoggerService extends Logger implements ILogger {
  debug(context: string, message: string) {
    if (process.env.NODE_ENV !== 'production') {
      super.debug(`[DEBUG] ${message}`, context);
    }
  }
  log(context: string, message: string) {
    super.log(`[INFO] ${message}`, context);
  }
  error(context: string, message: string, trace?: string) {
    super.error(`[ERROR] ${message}`, trace, context);
  }
  warn(context: string, message: string) {
    super.warn(`[WARN] ${message}`, context);
  }
  verbose(context: string, message: string) {
    if (process.env.NODE_ENV !== 'production') {
      super.verbose(`[VERBOSE] ${message}`, context);
    }
  }
}
```

### **Exceptions**
The logic is the same as the logger module. To avoid exception errors related to a specific Provider or Nodejs framework. I abstract the service.


This is the interface inside the `libs/utils/src/common/domain` folder.

```
export interface IFormatExceptionMessage {
  message: string;
  code_error?: number;
}

export interface IException {
  badRequestException(data: IFormatExceptionMessage): void;
  internalServerErrorException(data?: IFormatExceptionMessage): void;
  forbiddenException(data?: IFormatExceptionMessage): void;
  UnauthorizedException(data?: IFormatExceptionMessage): void;
}
```

The service is using Nestjs exception.
```
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { IException, IFormatExceptionMessage } from '../../domain/exceptions/exceptions.interface';

@Injectable()
export class ExceptionsService implements IException {
  badRequestException(data: IFormatExceptionMessage): void {
    throw new BadRequestException(data);
  }
  internalServerErrorException(data?: IFormatExceptionMessage): void {
    throw new InternalServerErrorException(data);
  }
  forbiddenException(data?: IFormatExceptionMessage): void {
    throw new ForbiddenException(data);
  }
  UnauthorizedException(data?: IFormatExceptionMessage): void {
    throw new UnauthorizedException(data);
  }
}
```

### **Repositories**
First, we will need an interface for our request. This interface will be important to abstract the repository. And If in the future you will want to change your ORM or your DB, you will not get problems with your logic.

```
import { TodoM } from '../model/todo';

export interface TodoRepository {
  insert(todo: TodoM): Promise<void>;
  findAll(): Promise<TodoM[]>;
  findById(id: number): Promise<TodoM>;
  updateContent(id: number, isDone: boolean): Promise<void>;
  deleteById(id: number): Promise<void>;
}
```

Now we need a module for our repository.

```nest g mo /infrastructure/repositories```

Create a file todo.repository.ts and implement the interface.
If you use VsCode you can get a helper to implement all your methods

And this is how the repository will look like.

```
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoM } from '../../domain/model/todo';
import { TodoRepository } from '../../domain/repositories/todoRepository.interface';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class DatabaseTodoRepository implements TodoRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly todoEntityRepository: Repository<Todo>,
  ) {}

  async updateContent(id: number, isDone: boolean): Promise<void> {
    await this.todoEntityRepository.update(
      {
        id: id,
      },
      { isDone: isDone },
    );
  }
  async insert(todo: TodoM): Promise<void> {
    const todoEntity = this.toTodoEntity(todo);
    await this.todoEntityRepository.insert(todoEntity);
  }
  async findAll(): Promise<TodoM[]> {
    const todosEntity = await this.todoEntityRepository.find();
    return todosEntity.map((todoEntity) => this.toTodo(todoEntity));
  }
  async findById(id: number): Promise<TodoM> {
    const todoEntity = await this.todoEntityRepository.findOneOrFail(id);
    return this.toTodo(todoEntity);
  }
  async deleteById(id: number): Promise<void> {
    await this.todoEntityRepository.delete({ id: id });
  }

  private toTodo(todoEntity: Todo): TodoM {
    const todo: TodoM = new TodoM();

    todo.id = todoEntity.id;
    todo.content = todoEntity.content;
    todo.isDone = todoEntity.isDone;
    todo.createdate = todoEntity.createdate;
    todo.updateddate = todoEntity.updateddate;

    return todo;
  }

  private toTodoEntity(todo: TodoM): Todo {
    const todoEntity: Todo = new Todo();

    todoEntity.id = todo.id;
    todoEntity.content = todo.content;
    todoEntity.isDone = todo.isDone;

    return todoEntity;
  }
}
```

### **Filter**
A middleware to catch errors in the code. It is not related to the subject and you can find more information on Nestjs. But this is our implementation.

```
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

interface IError {
  message: string;
  code_error: string;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request: any = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as IError)
        : { message: (exception as Error).message, code_error: null };

    const responseData = {
      ...{
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
      ...message,
    };

    this.logMessage(request, message, status, exception);

    response.status(status).json(responseData);
  }

  private logMessage(request: any, message: IError, status: number, exception: any) {
    if (status === 500) {
      this.logger.error(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
        status >= 500 ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
      );
    }
  }
}
```

And don’t forget to add this line in your main.ts

```app.useGlobalFilters(new AllExceptionFilter(new LoggerService()));```

### **Interceptor**
Same as for filter, to understand more about interceptor you can read Nestjs documentation.
The first interceptor it is for return a formatted response and gets a harmony for all response.

```
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ResponseFormat<T> {
  @ApiProperty()
  isArray: boolean;
  @ApiProperty()
  path: string;
  @ApiProperty()
  duration: string;
  @ApiProperty()
  method: string;

  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    return next.handle().pipe(
      map((data) => ({
        data,
        isArray: Array.isArray(data),
        path: request.path,
        duration: `${Date.now() - now}ms`,
        method: request.method,
      })),
    );
  }
}
```

The second interceptor is to handle the incoming request with some log.

```
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    const ip = this.getIP(request);

    this.logger.log(`Incoming Request on ${request.path}`, `method=${request.method} ip=${ip}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `End Request for ${request.path}`,
          `method=${request.method} ip=${ip} duration=${Date.now() - now}ms`,
        );
      }),
    );
  }

  private getIP(request: any): string {
    let ip: string;
    const ipAddr = request.headers['x-forwarded-for'];
    if (ipAddr) {
      const list = ipAddr.split(',');
      ip = list[list.length - 1];
    } else {
      ip = request.connection.remoteAddress;
    }
    return ip.replace('::ffff:', '');
  }
}
```

And don’t forget to import the interceptor in your main.ts

```app.useGlobalInterceptors(new LoggingInterceptor(new LoggerService()));```

```app.useGlobalInterceptors(new ResponseInterceptor());```

### **Module Usecases Proxy**
This file is the link between your use cases and your infrastructure, you will inject different services needed for your use cases. In this way, it will be easy to change service in the future and you respect the dependency injection (SOLID)
The file can become quiet big, I didn’t find a way to make it shorter and cleaner at the moment.

```
import { DynamicModule, Module } from '@nestjs/common';
import { addTodoUseCases } from '../../usecases/todo/addTodo.usecases';
import { deleteTodoUseCases } from '../../usecases/todo/deleteTodo.usecases';
import { GetTodoUseCases } from '../../usecases/todo/getTodo.usecases';
import { getTodosUseCases } from '../../usecases/todo/getTodos.usecases';
import { updateTodoUseCases } from '../../usecases/todo/updateTodo.usecases';
import { ExceptionsModule } from '../exceptions/exceptions.module';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/logger.service';
import { RepositoriesModule } from '../repositories/repositories.module';
import { DatabaseTodoRepository } from '../repositories/todo.repository';
import { UseCaseProxy } from './usecases-proxy';

@Module({
  imports: [LoggerModule, RepositoriesModule, ExceptionsModule],
})
export class UsecasesProxyModule {
  static GET_TODO_USECASES_PROXY = 'getTodoUsecasesProxy';
  static GET_TODOS_USECASES_PROXY = 'getTodosUsecasesProxy';
  static POST_TODO_USECASES_PROXY = 'postTodoUsecasesProxy';
  static DELETE_TODO_USECASES_PROXY = 'deleteTodoUsecasesProxy';
  static PUT_TODO_USECASES_PROXY = 'putTodoUsecasesProxy';

  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [
        {
          inject: [DatabaseTodoRepository],
          provide: UsecasesProxyModule.GET_TODO_USECASES_PROXY,
          useFactory: (todoRepository: DatabaseTodoRepository) => new UseCaseProxy(new GetTodoUseCases(todoRepository)),
        },
        {
          inject: [DatabaseTodoRepository],
          provide: UsecasesProxyModule.GET_TODOS_USECASES_PROXY,
          useFactory: (todoRepository: DatabaseTodoRepository) =>
            new UseCaseProxy(new getTodosUseCases(todoRepository)),
        },
        {
          inject: [LoggerService, DatabaseTodoRepository],
          provide: UsecasesProxyModule.POST_TODO_USECASES_PROXY,
          useFactory: (logger: LoggerService, todoRepository: DatabaseTodoRepository) =>
            new UseCaseProxy(new addTodoUseCases(logger, todoRepository)),
        },
        {
          inject: [LoggerService, DatabaseTodoRepository],
          provide: UsecasesProxyModule.PUT_TODO_USECASES_PROXY,
          useFactory: (logger: LoggerService, todoRepository: DatabaseTodoRepository) =>
            new UseCaseProxy(new updateTodoUseCases(logger, todoRepository)),
        },
        {
          inject: [LoggerService, DatabaseTodoRepository],
          provide: UsecasesProxyModule.DELETE_TODO_USECASES_PROXY,
          useFactory: (logger: LoggerService, todoRepository: DatabaseTodoRepository) =>
            new UseCaseProxy(new deleteTodoUseCases(logger, todoRepository)),
        },
      ],
      exports: [
        UsecasesProxyModule.GET_TODO_USECASES_PROXY,
        UsecasesProxyModule.GET_TODOS_USECASES_PROXY,
        UsecasesProxyModule.POST_TODO_USECASES_PROXY,
        UsecasesProxyModule.PUT_TODO_USECASES_PROXY,
        UsecasesProxyModule.DELETE_TODO_USECASES_PROXY,
      ],
    };
  }
}
```

### **Usecases**
In my architecture, I usually make one use case for one endpoint. In this example, we have 5 endpoints so we need 5 use cases. Why one use case for one endpoint? For the simple reason, if you have a monolithic code and you want to move on serverless, each use case will be one function (lambda, GCP function, firebase function,…) or if one use case has to be exported to another API ( could be a lambda ) you will copy past your use case, inject the dependency (logger, repository) and the logic will be done.
Keep in mind the logic have to be a pure typescript and import only module from domain.
This is an example for get todo:

```
import { TodoM } from '../../domain/model/todo';
import { TodoRepository } from '../../domain/repositories/todoRepository.interface';

export class getTodosUseCases {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(): Promise<TodoM[]> {
    return await this.todoRepository.findAll();
  }
}
```

### **Controllers**
The controllers can be called routes, you call your use cases in these files. The controllers have to keep clear and simple code. It is also here I write my swagger.
```
import { Body, Controller, Delete, Get, Inject, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseCaseProxy } from '../../usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '../../usecases-proxy/usecases-proxy.module';
import { GetTodoUseCases } from '../../../usecases/todo/getTodo.usecases';
import { TodoPresenter } from './todo.presenter';
import { ApiResponseType } from '../../common/swagger/response.decorator';
import { getTodosUseCases } from '../../../usecases/todo/getTodos.usecases';
import { updateTodoUseCases } from '../../../usecases/todo/updateTodo.usecases';
import { AddTodoDto, UpdateTodoDto } from './todo.dto';
import { deleteTodoUseCases } from '../../../usecases/todo/deleteTodo.usecases';
import { addTodoUseCases } from '../../../usecases/todo/addTodo.usecases';

@Controller('todo')
@ApiTags('todo')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiExtraModels(TodoPresenter)
export class TodoController {
  constructor(
    @Inject(UsecasesProxyModule.GET_TODO_USECASES_PROXY)
    private readonly getTodoUsecaseProxy: UseCaseProxy<GetTodoUseCases>,
    @Inject(UsecasesProxyModule.GET_TODOS_USECASES_PROXY)
    private readonly getAllTodoUsecaseProxy: UseCaseProxy<getTodosUseCases>,
    @Inject(UsecasesProxyModule.PUT_TODO_USECASES_PROXY)
    private readonly updateTodoUsecaseProxy: UseCaseProxy<updateTodoUseCases>,
    @Inject(UsecasesProxyModule.DELETE_TODO_USECASES_PROXY)
    private readonly deleteTodoUsecaseProxy: UseCaseProxy<deleteTodoUseCases>,
    @Inject(UsecasesProxyModule.POST_TODO_USECASES_PROXY)
    private readonly addTodoUsecaseProxy: UseCaseProxy<addTodoUseCases>,
  ) {}

  @Get('todo')
  @ApiResponseType(TodoPresenter, false)
  async getTodo(@Query('id', ParseIntPipe) id: number) {
    const todo = await this.getTodoUsecaseProxy.getInstance().execute(id);
    return new TodoPresenter(todo);
  }

  @Get('todos')
  @ApiResponseType(TodoPresenter, true)
  async getTodos() {
    const todos = await this.getAllTodoUsecaseProxy.getInstance().execute();
    return todos.map((todo) => new TodoPresenter(todo));
  }

  @Put('todo')
  @ApiResponseType(TodoPresenter, true)
  async updateTodo(@Body() updateTodoDto: UpdateTodoDto) {
    const { id, isDone } = updateTodoDto;
    await this.updateTodoUsecaseProxy.getInstance().execute(id, isDone);
    return 'success';
  }

  @Delete('todo')
  @ApiResponseType(TodoPresenter, true)
  async deleteTodo(@Query('id', ParseIntPipe) id: number) {
    await this.deleteTodoUsecaseProxy.getInstance().execute(id);
    return 'success';
  }

  @Post('todo')
  @ApiResponseType(TodoPresenter, true)
  async addTodo(@Body() addTodoDto: AddTodoDto) {
    const { content } = addTodoDto;
    const todoCreated = await this.addTodoUsecaseProxy.getInstance().execute(content);
    return new TodoPresenter(todoCreated);
  }
}
```

### **DTO**
The DTO (data transfer object) is the input data for the controller, it will be the data displayed on the swagger and the data verified before use. To check the fields I m using class-validator.

```
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  readonly isDone: boolean;
}

export class AddTodoDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly content: string;
}
```

### **Presenters**
If the DTO is the input data, the presenter's data is the output data. The Presenter has the role to format the data as the consumer want. Be sure to keep your logic clear and independent of the consumer requirement.

```
import { ApiProperty } from '@nestjs/swagger';
import { TodoM } from '../../../domain/model/todo';

export class TodoPresenter {
  @ApiProperty()
  id: number;
  @ApiProperty()
  content: string;
  @ApiProperty()
  isDone: boolean;
  @ApiProperty()
  createdate: Date;
  @ApiProperty()
  updateddate: Date;

  constructor(todo: TodoM) {
    this.id = todo.id;
    this.content = todo.content;
    this.isDone = todo.isDone;
    this.createdate = todo.createdate;
    this.updateddate = todo.updateddate;
  }
}
```

## **Conclusion**

I didn’t cover all parts of the code in the article but you can find the all code in the repository.
As you can see the code is huge, need time to prepare, and we can think it is overkill for a small example like this one. But with this architecture, everything can be changed easily: new requirement, migration to a new Npm module, new framework or move to serverless.
In the next articles I will cover the test, in another one migrate nestjs to express, it will be an interesting step because I will probably change some part of the code from OOP to Functional Programming. And to finish this series, try to use this architecture for serverless.
