import { BadRequestException, NotFoundException } from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
  constructor(productId: string) {
    super({
      code: 'PRODUCT_NOT_FOUND',
      message: `Product with ID ${productId} not found`,
    });
  }
}

export class ProductAlreadyExistsException extends BadRequestException {
  constructor(name: string) {
    super({
      code: 'PRODUCT_ALREADY_EXISTS',
      message: `Product with name "${name}" already exists`,
    });
  }
}

export class CategoryNotFoundException extends NotFoundException {
  constructor(categoryId: string) {
    super({
      code: 'CATEGORY_NOT_FOUND',
      message: `Category with ID ${categoryId} not found`,
    });
  }
}

export class CategoryAlreadyExistsException extends BadRequestException {
  constructor(name: string) {
    super({
      code: 'CATEGORY_ALREADY_EXISTS',
      message: `Category with name "${name}" already exists`,
    });
  }
}

export class CategoryHasProductsException extends BadRequestException {
  constructor(categoryId: string) {
    super({
      code: 'CATEGORY_HAS_PRODUCTS',
      message: `Cannot delete category with ID ${categoryId} because it contains products`,
    });
  }
}

export class InvalidImportException extends BadRequestException {
  constructor(reason: string, errors?: any[]) {
    super({
      code: 'IMPORT_INVALID_CSV',
      message: reason,
      errors,
    });
  }
}

export class ExportFailedException extends BadRequestException {
  constructor(reason: string) {
    super({
      code: 'EXPORT_FAILED',
      message: reason,
    });
  }
}