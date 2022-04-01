---
title: Simple CRUD in NestJS
date: 2020-08-23
author: Dominik
tags:
  - JavaScript
  - TypeScript
  - NestJS
  - CRUD
---

## Some words for start...

[NestJS](http://nestjs.com) is really great framework for people who want to learn writing RESTful APIs. I would like to recommend it, because personally it helped me, when I started my adventure with nodejs even by indicating he structure of project. And now I would like to share my experience with you.

This is first post from series about NestJS and OAuth, you can find code from this article on my [Github](https://github.com/raspi684/NestJS-OAuth/tree/Simple-CRUD). Today we will add simple CRUD (Create, Read, Update, Delete actions) for users resource to our application.

### NestJS CLI

We will use NestJS CLI, it’s really convenient way growing application. This CLI provides nest app generator and also modules for it like controllers, services and much more. I really recommend using this tool. `npm install -g @nestjs/cli`

## Let's begin

With CLI create a new application:

- `$ nest new oauth-example`
- `$ cd oauth-example`

We provide all variables like app id and secret via .env file, so first need to install @nestjs/config package: `$ npm i --save @nestjs/config` Then update app.module.ts file by adding `ConfigModule.forRoot()` in module imports:

```ts
// app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

When it's done, we can connect our application with database, and for this example it's MySQL. In this step we need some dependencies:

`$ npm install --save @nestjs/typeorm typeorm mysql class-validator class-transformer`

Next add `TypeOrmModule.forRoot({...})` in app.module.ts imports array. In this case we don't use migrations, so is necessary to set synchronize property to true. In production code it's dangerous.

```ts
// app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### What will our user look like?

We would store user as entity, that has: id, firstname, lastname, password (may be null), email (should be unique), google profile id and facebook profile id (which also may be null). In this moment we also define which fields should be hide while sending response, this will be ensured by `@Exclude()` decorator from class-transformer package. So create user definition:

```ts
// user.entity.ts;
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: null })
  @Exclude()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: null })
  @Exclude()
  googleId: string;

  @Column({ default: null })
  @Exclude()
  facebookId: string;
}
```

Now, we have to tell typeorm to use this entity. In `app.module.ts` file import `user.entity.ts` and put it in entity array. In this moment if you start application, you see updated database. At this moment hiding fields require add one line in `main.ts` file in `bootstrap()` method: `app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))`

### We're nearing the end

Now create some files:

- `$ nest generate module users`
- `$ nest generate service users`
- `$ nest generate controller users`

Before we begin, create one more file, that will be our request validator (and in `main.ts` file we have to add another line: `app.useGlobalPipes(new ValidationPipe());`):

```ts
// CreateUpdateUser.dto.ts
import { IsNotEmpty, IsEmail } from "class-validator";

export default class CreateUpdateUser {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

Then edit `users.service.ts` file, there we implements logic for simple managing users:

```ts
// users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import CreateUpdateUser from "./dto/CreateUpdateUser.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: string) {
    return this.usersRepository.findOne(id);
  }

  findBy(criteria: any) {
    return this.usersRepository.find(criteria);
  }

  async store(data: CreateUpdateUser) {
    if ((await this.usersRepository.findAndCount({ email: data.email }))[1] > 0)
      throw new BadRequestException("User already exists");
    const user = new User();

    // WARNING: In this case password is stored as PLAINTEXT
    // It is only for show how it works!!!
    Object.assign(user, data);

    return this.usersRepository.save(user);
  }

  async update(id: string, data: CreateUpdateUser) {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new NotFoundException();

    // WARNING: In this case password is stored as PLAINTEXT
    // It is only for show how it works!!!
    Object.assign(user, data);

    this.usersRepository.update(id, user);
    return user;
  }

  async destroy(id: string) {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new NotFoundException();
    this.usersRepository.remove(user);
  }
}
```

Next we can create first endpoints, for simple CRUD operations:

```ts
// users.controller.ts
import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Body,
  Put,
  Delete,
  HttpCode,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import CreateUpdateUser from "./dto/CreateUpdateUser.dto";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /users
  @Get()
  async index() {
    return this.usersService.findAll();
  }

  // GET /users/:id
  @Get(":id")
  async show(@Param("id") id: string) {
    const user = await this.usersService.findOne(id);
    if (user) return user;
    throw new NotFoundException("User not found");
  }

  // POST /users
  @Post()
  async store(@Body() data: CreateUpdateUser) {
    return await this.usersService.store(data);
  }

  // PUT /users/:id
  @Put(":id")
  async update(@Param("id") id: string, @Body() data: CreateUpdateUser) {
    return await this.usersService.update(id, data);
  }

  // DELETE /users/:id
  @Delete(":id")
  @HttpCode(204)
  async destroy(@Param("id") id: string) {
    await this.usersService.destroy(id);
    return;
  }
}
```

And that's all for this part! Now you can perform basic operations for users: fetching, storing, updating and deleting. Code from this post is on my github [(click)](https://github.com/raspi684/NestJS-OAuth/tree/Simple-CRUD)

## What do you think about this article?

Do you have any questions? Or maybe I explained something vaguely? Ask it below!
