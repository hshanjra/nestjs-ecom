import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from 'src/schemas/product.schema';
import { Model, MongooseQueryOptions } from 'mongoose';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { ProductImage } from 'src/interfaces';
import { CompatiblePartsQuery } from './dto/compatible-query.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /* FOR SELLERS */

  // create product
  async create(
    dto: CreateProductDto,
    productImages: Express.Multer.File[],
    merchantId: string,
  ): Promise<Product> {
    const uploadedImages = await this.uploadAndMapImages(productImages);

    const productDetails = this.buildProductDetails(
      dto,
      uploadedImages,
      merchantId,
    );

    return await this.productModel.create(productDetails);
  }

  // Update product
  async updateSellerProduct(
    slug: string,
    dto: UpdateProductDto,
    merchantId: string,
    images?: Express.Multer.File[],
  ): Promise<Product> {
    const product = await this.productModel.findOne({
      productSlug: slug,
      merchantId: merchantId,
    });

    if (!product) throw new NotFoundException('Product not found');

    // Handle images if provided
    if (images && images.length > 0) {
      const uploadedImages = await this.uploadAndMapImages(images);
      product.productImages.push(...uploadedImages); // Assuming productImages is an array
    }
    // Update product data
    Object.assign(product, dto);

    //TODO: remove sensitive fields

    // Save the updated product data
    await product.save();

    return product;
  }

  // find product by slug
  async findBySlug(slug: string) {
    return await this.productModel.findOne({ productSlug: slug });
  }

  async findAllSellerProducts(merchantId: string) {
    //TODO: add pagination and offset
    const sellerProducts = await this.productModel
      .find({ merchantId })
      .select(
        '_id productTitle productSlug productBrand shortDescription partNumber productStock regularPrice salePrice productImages isActive createdAt',
      );
    return sellerProducts;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  /* FOR CUSTOMERS */

  async findActiveProductByProductId(productId: string): Promise<Product> {
    return await this.productModel
      .findOne({ productId: productId, isActive: true })
      .select('-merchant -isActive -isFeaturedProduct -_id')
      .populate('category', '-_id -createdAt -updatedAt -__v');
  }

  async findActiveProductBySlug(slug: string): Promise<Product> {
    return await this.productModel
      .findOne({ productSlug: slug, isActive: true })
      .select('-merchantId -isActive -isFeaturedProduct');
  }

  async findAll(qry: ProductQueryDto) {
    // TODO: make, model, year filter pending
    let options: MongooseQueryOptions = {};

    // Search Query
    if (qry.q) {
      options = {
        $or: [
          { productTitle: new RegExp(qry.q, 'i') },
          { productSlug: new RegExp(qry.q, 'i') },
          { partNumber: new RegExp(qry.q, 'i') },
          { description: new RegExp(qry.q, 'i') },
          { shortDescription: new RegExp(qry.q, 'i') },
          { productBrand: new RegExp(qry.q, 'i') },
        ],
      };
    }

    const query = this.productModel.find({ ...options, isActive: true });

    // Sorting
    if (qry.sort) {
      switch (qry.sort) {
        case 'price-asc':
          query.sort({ salePrice: 1 });
          break;
        case 'price-desc':
          query.sort({ salePrice: -1 });
          break;
        case 'popular':
          query.sort({ salesCount: -1 });
          break;

        case 'asc':
          query.sort({ createdAt: -1 });
          break;

        case 'desc':
          query.sort({ createdAt: 1 });
          break;

        case 'none':
          query.sort({ createdAt: -1 });
          break;

        default:
          query.sort({ createdAt: -1 });
          break;
      }
    }

    // Price Range
    if ((parseInt(qry.minPrice) && parseInt(qry.maxPrice)) >= 0) {
      const minPrice = Math.min(parseInt(qry.minPrice), parseInt(qry.maxPrice));
      const maxPrice = Math.max(parseInt(qry.minPrice), parseInt(qry.maxPrice));
      query.where('salePrice').gte(minPrice).lte(maxPrice);
    }

    // Brand Filter
    if (qry.brand) {
      const brands = qry.brand.split(',');
      query.where('productBrand').in(brands);
    }

    // Status Filter
    if (qry.status) {
      switch (qry.status) {
        case 'inStock':
          query.where('productStock').gt(0);
          break;
        case 'onSale':
          query.where('onSale', true);
          break;
        case 'outOfStock':
          query.where('productStock').lte(0);
          break;
        default:
          break;
      }
    }

    // Condition Filter
    if (qry.condition) {
      const cond = qry.condition.toUpperCase().split(',');
      if (cond.includes('NEW') || cond.includes('USED')) {
        query.where('productCondition').in(cond);
      }
    }

    // Featured
    if (qry.featured === ('true' as any)) {
      query.where('isFeaturedProduct', true);
    }

    // const allProducts = await this.productModel
    //   .find({
    //     isActive: true,
    //   })
    //   .limit(Number(query?.limit) || 4)
    //   .sort({ createdAt: -1 })
    //   .populate('category', 'categoryName categorySlug')
    //   // .select('-merchantId -updatedAt -isActive -__v')
    //   .exec();

    const page: number = parseInt(qry?.page) || 1;
    // max limit is 100
    const limit: number =
      qry.limit && parseInt(qry?.limit) <= 100 ? parseInt(qry?.limit) : 50;
    const skip: number = (page - 1) * limit;

    const totalCount = await this.productModel.countDocuments(query);
    const products = await query
      .limit(limit)
      .select('-merchantId -updatedAt -isActive -__v')
      .skip(skip)
      .exec();

    if (!products) throw new NotFoundException('No products found.');
    return { products: products, totalCount: totalCount };
  }

  async findOne(slug: string) {
    const getSingle = await this.productModel
      .findOne({ productSlug: slug, isActive: true })
      .select('-merchantId -updatedAt -isActive -__v');

    if (!getSingle) throw new NotFoundException('Product not found.');
    return getSingle;
  }

  async findHotSelling() {
    return 'This will handle the hot selling products';
  }

  async findFeatured() {
    const featuredProducts = await this.productModel
      .find({
        isActive: true,
        isFeaturedProduct: true,
      })
      .limit(20);
    if (!featuredProducts.length)
      throw new NotFoundException('No featured products');
    return featuredProducts;
  }

  async findCompatibleParts(query: CompatiblePartsQuery) {
    // TODO: use pagination and offset
    // TODO: disable checking case sensitivity
    const compatibleParts = await this.productModel
      .find({
        isActive: true,
        'compatibleWith.vehicleMake': query.make,
      })
      .where('compatibleWith.vehicleModel')
      .equals(query.model)
      .where('compatibleWith.vehicleYear')
      .equals(query.year)
      .select(
        '-merchantId -updatedAt -__v -compatibleWith -isActive -isGenericProduct',
      )
      .exec();

    if (!compatibleParts.length)
      throw new NotFoundException('No compatible parts found.');
    return compatibleParts;
  }

  /* SHARED */
  // Decrease the stock by ordered quantity
  async decreaseProductStock(
    productId: string,
    orderedQty: number,
  ): Promise<boolean> {
    // Find the product by productId
    const product = await this.productModel.findOne({ productId });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    // Decrease the stock by ordered quantity
    product.productStock -= orderedQty;

    // Save the updated product
    await product.save();

    return true;
  }

  /* PRIVATE METHODS */

  private async uploadAndMapImages(
    images: Express.Multer.File[],
  ): Promise<any[]> {
    const uploadedImages = await Promise.all(
      images.map((image) => this.cloudinaryService.uploadSingleImage(image)),
    );

    return uploadedImages.map((image) => ({
      url: image.url,
      alt: image.alt || 'Product image', // Provide default alt text if not available
      filetype: image.fileType,
    }));
  }

  private buildProductDetails(
    dto: CreateProductDto,
    images: ProductImage[],
    merchantId: string,
  ): any {
    const {
      productLength,
      productHeight,
      productWidth,
      compatibleMake,
      compatibleModel,
      compatibleSubmodel,
      compatibleEngine,
      compatibleYear,
    } = dto;

    return {
      ...dto,
      productDimensions: {
        length: productLength,
        height: productHeight,
        width: productWidth,
      },
      productImages: images,
      compatibleWith: {
        vehicleMake: compatibleMake,
        vehicleModel: compatibleModel,
        vehicleSubmodel: compatibleSubmodel,
        vehicleEngine: compatibleEngine,
        vehicleYear: compatibleYear,
      },
      merchant: merchantId,
    };
  }
}
