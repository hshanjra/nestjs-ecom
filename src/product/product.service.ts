/* FOR SELLERS */ import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  async create(
    createProductDto: CreateProductDto,
    productImages: Express.Multer.File[],
  ) {
    const uploadedImages = await Promise.all(
      productImages.map((image) =>
        this.cloudinaryService.uploadSingleImage(image),
      ),
    );

    const pImages: ProductImage[] = uploadedImages.map((image) => ({
      url: image.url,
      alt: image.alt,
      fileType: image.fileType,
    }));

    return await this.productModel.create({
      ...createProductDto,
      productDimensions: {
        length: createProductDto.productLength,
        height: createProductDto.productHeight,
        width: createProductDto.productWidth,
      },
      productImages: pImages,
      compatibleWith: {
        vehicleMake: createProductDto.compatibleMake,
        vehicleModel: createProductDto.compatibleModel,
        vehicleSubmodel: createProductDto.compatibleSubmodel,
        vehicleEngine: createProductDto.compatibleEngine,
        vehicleYear: createProductDto.compatibleYear,
      },

      merchantId: '6621547d2b57a5386df7c45e',
    });
  }

  async findAllSellerProducts(sellerId: string) {
    //TODO: add pagination and offset
    const sellerProducts = await this.productModel
      .find({ merchantId: sellerId })
      .select(
        '_id productTitle productSlug productBrand shortDescription partNumber productStock regularPrice salePrice productImages isActive createdAt',
      );
    return sellerProducts;
  }

  async updateSellerProduct(
    slug: string,
    dto: UpdateProductDto,
    images?: Express.Multer.File[],
  ) {
    const merchantId = '6621547d2b57a5386df7c45e';

    const product = await this.productModel.findOne({
      productSlug: slug,
      merchantId: merchantId,
    });

    if (!product) throw new NotFoundException('Product not found');

    //hanlde images
    if (images && images.length > 0) {
      for (const file of images) {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/jpg',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            'Product images must be of type JPEG, PNG, GIF, WebP.',
          );
        }
        // Upload Images on clodinary if available
        const uploadedImages = await Promise.all(
          images.map((image) =>
            this.cloudinaryService.uploadSingleImage(image),
          ),
        );

        const productImages = uploadedImages.map((image) => ({
          url: image.url,
          alt: image.alt,
          filetype: image.fileType,
        }));

        //push the new product images
        product.productImages.push(...productImages);
      }
    }
    //hanlde form data

    // Update product data
    Object.assign(product, dto);

    //TODO: remove sensitive fields

    // Save the updated product data
    await product.save();

    return product;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  /* FOR CUSTOMERS */
  async findAll() {
    //TODO: add pagination and offset
    const allProducts = await this.productModel
      .find({
        isActive: true,
      })
      .populate('productCategory', 'categoryName categorySlug')
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
}
