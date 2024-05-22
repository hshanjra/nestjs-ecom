import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from 'src/schemas/product.schema';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { ProductImage } from 'src/interfaces';
import { CompatiblePartsQuery } from './dto/compatible-query.dto';

interface paginateArgs {
  page: number;
  pageSize: number;
}

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

  // Upate product
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

  async findAll() {
    //TODO: add pagination and offset
    const allProducts = await this.productModel
      .find({
        isActive: true,
      })
      .populate('category', 'categoryName categorySlug')
      // .select('-merchantId -updatedAt -isActive -__v')
      .exec();
    if (!allProducts) throw new NotFoundException('No products found.');
    return allProducts;
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
