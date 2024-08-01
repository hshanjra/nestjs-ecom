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
import { Category } from 'src/schemas/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
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
      .populate('categoryId', '-_id -createdAt -updatedAt -__v');
  }

  async findActiveProductBySlug(slug: string): Promise<Product> {
    return await this.productModel
      .findOne({ productSlug: slug, isActive: true })
      .populate('categoryId', 'categoryName categorySlug')
      .select('-merchantId -isActive -isFeaturedProduct');
  }

  async findAll(qry: ProductQueryDto) {
    // TODO: make, model, year filter pending
    let options: MongooseQueryOptions = {};

    // Search Query
    if (qry.q) {
      options = {
        $or: [
          { productTitle: { $regex: qry.q, $options: 'i' } },
          { productSlug: { $regex: qry.q, $options: 'i' } },
          { partNumber: { $regex: qry.q, $options: 'i' } },
          { description: { $regex: qry.q, $options: 'i' } },
          { shortDescription: { $regex: qry.q, $options: 'i' } },
          { productBrand: { $regex: qry.q, $options: 'i' } },
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
          query.sort({ createdAt: 1 });
          break;

        case 'desc':
          query.sort({ createdAt: -1 });
          break;

        case 'none':
          query.sort({ createdAt: -1 });
          break;

        default:
          query.sort({ createdAt: -1 });
          break;
      }
    }

    // Category Filter
    if (qry.category) {
      const category = await this.categoryModel
        .findOne({ categorySlug: qry.category })
        .exec();

      if (category) {
        // TODO: return products with passed category only
        const categories = await this.categoryModel
          .find({ $or: [{ _id: category._id }, { parent: category._id }] })
          .exec();
        const categoryIds = categories.map((category) => category._id);
        query.where('categoryId').in(categoryIds);
      }
    }

    // Price Range
    const minPrice = Number(qry.minPrice) || 0; // Default to 0 if not provided
    const maxPrice = Number(qry.maxPrice) || Infinity; // Default to Infinity if not provided

    // Apply query if maxPrice is greater than 0 and minPrice is >= 0
    if (maxPrice > 0 && minPrice >= 0) {
      const effectiveMinPrice = Math.min(minPrice, maxPrice);
      const effectiveMaxPrice = Math.max(minPrice, maxPrice);
      query.where('salePrice').gte(effectiveMinPrice).lte(effectiveMaxPrice);
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
      // .populate('categoryId', 'categoryName categorySlug')
      .skip(skip)
      .exec();

    if (!products) throw new NotFoundException('No products found.');
    return { products: products, totalCount: totalCount };
  }

  async findOne(slug: string) {
    const getSingle = await this.productModel
      .findOne({ productSlug: slug, isActive: true })
      .populate('categoryId', 'categoryName categorySlug')
      // .populate('merchant', 'merchantName merchantSlug')
      .select('-merchantId -updatedAt -isActive -__v')
      .exec();

    if (!getSingle) throw new NotFoundException('Product not found.');
    return getSingle;
  }

  async getProductsByCategory(slug: string): Promise<Product[]> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      return [];
    }

    const categories = await this.categoryModel
      .find({ $or: [{ _id: category._id }, { parent: category._id }] })
      .exec();
    const categoryIds = categories.map((category) => category._id);

    return await this.productModel
      .find({ category: { $in: categoryIds } })
      .populate('category')
      .exec();
  }

  async findHotSelling() {
    return 'This will handle the hot selling products';
  }

  // async findFeatured() {
  //   const featuredProducts = await this.productModel
  //     .find({
  //       isActive: true,
  //       isFeaturedProduct: true,
  //     })
  //     .limit(20);
  //   if (!featuredProducts.length)
  //     throw new NotFoundException('No featured products');
  //   return featuredProducts;
  // }

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
