import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";
import { ValidationError as CustomValidationError } from "@/shares/error";

export interface ValidationOptions {
  validationGroup?: string;
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
}

export function validateDto<T extends object>(
  dtoClass: new () => T,
  options: ValidationOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform plain object to DTO class instance
      const dtoInstance = plainToClass(dtoClass, req.body, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      });

      // Validate the DTO instance
      const errors = await validate(dtoInstance, {
        skipMissingProperties: options.skipMissingProperties ?? false,
        whitelist: options.whitelist ?? true,
        forbidNonWhitelisted: options.forbidNonWhitelisted ?? false,
        groups: options.validationGroup ? [options.validationGroup] : undefined,
      });

      if (errors.length > 0) {
        const validationErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        throw new CustomValidationError(
          "Validation failed",
          validationErrors
        );
      }

      // Replace req.body with validated and transformed data
      req.body = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T extends object>(
  dtoClass: new () => T,
  options: ValidationOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToClass(dtoClass, req.query, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      });

      const errors = await validate(dtoInstance, {
        skipMissingProperties: options.skipMissingProperties ?? false,
        whitelist: options.whitelist ?? true,
        forbidNonWhitelisted: options.forbidNonWhitelisted ?? false,
        groups: options.validationGroup ? [options.validationGroup] : undefined,
      });

      if (errors.length > 0) {
        const validationErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        throw new CustomValidationError(
          "Query validation failed",
          validationErrors
        );
      }

      req.query = dtoInstance as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T extends object>(
  dtoClass: new () => T,
  options: ValidationOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToClass(dtoClass, req.params, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      });

      const errors = await validate(dtoInstance, {
        skipMissingProperties: options.skipMissingProperties ?? false,
        whitelist: options.whitelist ?? true,
        forbidNonWhitelisted: options.forbidNonWhitelisted ?? false,
        groups: options.validationGroup ? [options.validationGroup] : undefined,
      });

      if (errors.length > 0) {
        const validationErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        throw new CustomValidationError(
          "Parameter validation failed",
          validationErrors
        );
      }

      req.params = dtoInstance as any;
      next();
    } catch (error) {
      next(error);
    }
  };
} 