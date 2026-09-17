import os

files_to_fix = [
    'apps/backend/src/modules/products/__tests__/unit/products.repository.spec.ts',
    'apps/backend/src/modules/products/__tests__/unit/products.service.spec.ts',
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Fix repository imports
        content = content.replace(
            "import { ProductsRepository } from '../src/modules/products/repositories/products.repository';",
            "import { ProductsRepository } from '../../repositories/products.repository';"
        )
        content = content.replace(
            "import { Product } from '../src/modules/products/entities/product.entity';",
            "import { Product } from '../../entities/product.entity';"
        )
        content = content.replace(
            "import { IProductsRepository } from '../src/modules/products/interfaces/products.repository.interface';",
            "import { IProductsRepository } from '../../interfaces/products.repository.interface';"
        )
        content = content.replace(
            "import { IProductCategoriesRepository } from '../src/modules/products/interfaces/product-categories.repository.interface';",
            "import { IProductCategoriesRepository } from '../../interfaces/product-categories.repository.interface';"
        )
        content = content.replace(
            "import { CreateProductDto } from '../src/modules/products/dto/create-product.dto';",
            "import { CreateProductDto } from '../../dto/create-product.dto';"
        )
        content = content.replace(
            "import { ProductCategory } from '../src/modules/products/entities/product-category.entity';",
            "import { ProductCategory } from '../../entities/product-category.entity';"
        )
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f'Fixed {filepath}')