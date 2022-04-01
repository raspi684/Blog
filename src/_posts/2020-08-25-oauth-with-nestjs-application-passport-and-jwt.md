---
title: Passport & JWT in NestJS
date: 2020-08-25
author: Dominik
tags:
  - JavaScript
  - TypeScript
  - NestJS
  - JWT
  - JSON Web Tokens
  - Authentication
  - PassportJS
---

Almost every application has protected routes. It's clearly that guest on our page shouldn't have permission to edit e.g. blogposts. Today we will handle it by PassportJS and JSON Web Tokens.

This is second post from series about NestJS and OAuth, you can find code from this post on my [Github](https://github.com/raspi684/NestJS-OAuth/tree/passport-jwt). Today we will add JSON Web Tokens (JWT) to our application and protect some routes with them.

## Implementing PassportJS

### Installing packages

Before we start, we have to add some packages:

- `$ npm install --save @nestjs/passport passport passport-local`
- `$ npm install --save-dev @types/passport-local`

Then let's create auth module:

- `$ nest g module auth`
- `$ nest g controller auth`
- `$ nest g service auth`

### Adding logic

We will use UsersService in AuthService, but it requires to export UsersService in users.module.ts file by just adding `exports: [UsersService]` in `@Module({...})`. Now we're ready to fill our files.

```ts
// auth.service.ts
import { Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/user.entity";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = (
      await this.usersService.findBy({ where: [{ email: username }], take: 1 })
    )[0];
    if (user && user.password === password) return user;
    return null;
  }
}
```

```ts
// auth.controller.ts
import { Controller, UseGuards, Post, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController {
  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Req() req) {
    return req.user;
  }
}
```

Passport use strategies to authenticate users, now we use local strategy (username and password). So create one:

```ts
// local-strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { Strategy } from "passport-local";
import { User } from "src/users/user.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
```

Now we can complete this part:

```ts
// auth.module.ts
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local-strategy";

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
```

At this moment you can test our app, by sending POST request to `/auth/login` endpoint with username and password properties. It should return only id, firstname, lastname and email field. Password, facebookId and googleId is hidden, because we added `@Exclude()` decorator in our `User.entity.ts`.

It's time to add JWT. To do this step we need to install another dependencies:

- `$ npm install --save @nestjs/jwt passport-jwt`
- `$ npm install --save-dev @types/passport-jwt`

In auth.service.ts file we will use JwtService, so add it similarly as UsersService. Also there we add method that generate and return our access token:

```ts
// auth.service.ts
import { Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/user.entity";
import { JwtService } from "@nestjs/jwt";
import { use } from "passport";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = (
      await this.usersService.findBy({ where: [{ email: username }], take: 1 })
    )[0];
    if (user && user.password === password) return user;
    return null;
  }

  async login(user: User) {
    return {
      access_token: this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRE_TIME,
        }
      ),
    };
  }
}
```

Next we also modify controller, let it return `this.authService.login(req.user)` instead of `req.user`. After this step, we create new auth strategy:

```ts
// jwt-strategy.ts
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.username,
    };
  }
}
```

Now we just add import and provider in auth module.

```ts
// auth.module.ts
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local-strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt-strategy";

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
```

And that's all! Now we can protecting routes by adding decorator `@UseGuards(AuthGuard('jwt'))`. Let's test it in users controller:

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
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import CreateUpdateUser from "./dto/CreateUpdateUser.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /users
  @Get()
  @UseGuards(AuthGuard("jwt"))
  async index() {
    return this.usersService.findAll();
  }

  // GET /users/:id
  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  async show(@Param("id") id: string) {
    const user = await this.usersService.findOne(id);
    if (user) return user;
    throw new NotFoundException("User not found");
  }

  // POST /users
  @Post()
  @UseGuards(AuthGuard("jwt"))
  async store(@Body() data: CreateUpdateUser) {
    return await this.usersService.store(data);
  }

  // PUT /users/:id
  @Put(":id")
  @UseGuards(AuthGuard("jwt"))
  async update(@Param("id") id: string, @Body() data: CreateUpdateUser) {
    return await this.usersService.update(id, data);
  }

  // DELETE /users/:id
  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  @HttpCode(204)
  async destroy(@Param("id") id: string) {
    await this.usersService.destroy(id);
    return;
  }
}
```

And now, if you try hit endpoints `/users`, you get 401 error. To access this resource you must get access token and set header `Authorization: Bearer <token>`.

## What do you think about this article?

Do you have any questions? Or maybe I explained something vaguely? Ask it below!
