import {
CreationOptional,
DataTypes,
InferAttributes,
InferCreationAttributes,
Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export class Product extends Model<
InferAttributes<Product>,
InferCreationAttributes<Product>
>
{
declare id: CreationOptional<string>;

declare categoryId: string;

declare name: string;
declare slug: string;
declare description: string | null;
declare brand: string | null;

declare basePrice: string;
declare discountPrice: string | null;

declare mainImage: string | null;
declare mainImagePublicId: string | null;

declare images: string[];
declare imagePublicIds: string[];

declare isActive: CreationOptional<boolean>;

declare readonly createdAt: CreationOptional<Date>;
declare readonly updatedAt: CreationOptional<Date>;
}

Product.init(
{
id: {
type: DataTypes.UUID,
defaultValue: DataTypes.UUIDV4,
primaryKey: true,
},

categoryId: {
  type: DataTypes.UUID,
  allowNull: false,
  field: "category_id",
},

name: {
  type: DataTypes.STRING(200),
  allowNull: false,
  validate: {
    notEmpty: true,
    len: [2, 200],
  },
},

slug: {
  type: DataTypes.STRING(220),
  allowNull: false,
  unique: true,
  validate: {
    notEmpty: true,
    len: [2, 220],
  },
},

description: {
  type: DataTypes.TEXT,
  allowNull: true,
},

brand: {
  type: DataTypes.STRING(100),
  allowNull: true,
},

basePrice: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: false,
  field: "base_price",
  validate: {
    min: 0,
  },
},

discountPrice: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  field: "discount_price",
  validate: {
    min: 0,
  },
},

mainImage: {
  type: DataTypes.STRING(500),
  allowNull: true,
  field: "main_image",
},

mainImagePublicId: {
  type: DataTypes.STRING(500),
  allowNull: true,
  field: "main_image_public_id",
},

images: {
  type: DataTypes.JSONB,
  allowNull: false,
  defaultValue: [],
},

imagePublicIds: {
  type: DataTypes.JSONB,
  allowNull: false,
  defaultValue: [],
  field: "image_public_ids",
},

isActive: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: true,
  field: "is_active",
},

createdAt: {
  type: DataTypes.DATE,
  allowNull: false,
  field: "created_at",
},

updatedAt: {
  type: DataTypes.DATE,
  allowNull: false,
  field: "updated_at",
},

},
{
sequelize,
tableName: "products",
modelName: "Product",
timestamps: true,
}
);