import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { IPrismaService } from "../shared/prisma";
import { LoggerService } from "../shared/logger";

export class UserModule {
  private router: Router;
  private userController: UserController;
  private userService: UserService;

  constructor(
    private prismaService: IPrismaService,
    private loggerService: LoggerService,
  ) {
    this.router = Router();

    this.userService = new UserService(this.prismaService, this.loggerService);

    this.userController = new UserController(this.userService, this.loggerService);

    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use("/", this.userController.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }

  public getUserController(): UserController {
    return this.userController;
  }
}
