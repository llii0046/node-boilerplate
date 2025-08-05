import { createPaginator, PaginateFunction } from "prisma-pagination";

export class PaginationService {
  private static instance: PaginationService;
  private paginate: PaginateFunction;

  private constructor() {
    this.paginate = createPaginator({ perPage: 10 });
  }

  public static getInstance(): PaginationService {
    if (!PaginationService.instance) {
      PaginationService.instance = new PaginationService();
    }
    return PaginationService.instance;
  }

  public getPaginator(): PaginateFunction {
    return this.paginate;
  }

  // 或者提供自定义配置的方法
  public createPaginator(options: { perPage?: number }): PaginateFunction {
    return createPaginator(options);
  }
} 