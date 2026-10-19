import { User } from "./User.js";
import { Category } from "./Category.js";
import { Product } from "./Product.js";
import { ProductVariant } from "./ProductVariant.js";
import { Inventory } from "./Inventory.js";
import { Cart } from "./Cart.js"; 
import { CartItem } from "./CartItem.js";
import { Wishlist } from "./Wishlist.js";
import { WishlistItem } from "./WishlistItem.js";
import {Order} from "./Order.js";
import {OrderItem} from "./OrderItem.js";
import { Conversation } from "./Conversation.js";
import { ChatMessage } from "./ChatMessage.js";

Category.belongsTo(Category, {
  foreignKey: "parentId",
  as: "parent",
});

Category.hasMany(Category, {
  foreignKey: "parentId",
  as: "children",
});

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Product.hasMany(ProductVariant, {
  foreignKey: "productId",
  as: "variants",
  onDelete: "CASCADE",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

ProductVariant.hasOne(Inventory, {
  foreignKey: "variantId",
  as: "inventory",
  onDelete: "CASCADE",
});

Inventory.belongsTo(ProductVariant, {
  foreignKey: "variantId",
  as: "variant",
});

/*
 * Cart relationships
 */

User.hasOne(Cart, {
  foreignKey: "userId",
  as: "cart",
  onDelete: "CASCADE",
});

Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
  as: "cart",
});

/*
 * Cart item → Product variant
 */

ProductVariant.hasMany(CartItem, {
  foreignKey: "variantId",
  as: "cartItems",
  onDelete: "CASCADE",
});

CartItem.belongsTo(ProductVariant, {
  foreignKey: "variantId",
  as: "variant",
});


User.hasOne(Wishlist, {
  foreignKey: "userId",
  as: "wishlist",
  onDelete: "CASCADE",
});

Wishlist.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Wishlist.hasMany(WishlistItem, {
  foreignKey: "wishlistId",
  as: "items",
  onDelete: "CASCADE",
});

WishlistItem.belongsTo(Wishlist, {
  foreignKey: "wishlistId",
  as: "wishlist",
});

Product.hasMany(WishlistItem, {
  foreignKey: "productId",
  as: "wishlistItems",
  onDelete: "CASCADE",
});

WishlistItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});


User.hasMany(Order, {
foreignKey: "userId",
as: "orders",
});

Order.belongsTo(User, {
foreignKey: "userId",
as: "user",
});

Order.hasMany(OrderItem, {
foreignKey: "orderId",
as: "items",
onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
foreignKey: "orderId",
as: "order",
});

ProductVariant.hasMany(OrderItem, {
foreignKey: "variantId",
as: "orderItems",
onDelete: "SET NULL",
});

OrderItem.belongsTo(ProductVariant, {
foreignKey: "variantId",
as: "variant",
});


User.hasOne(Conversation, {
  foreignKey: "customerId",
  as: "conversation",
});

Conversation.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

Conversation.hasMany(ChatMessage, {
  foreignKey: "conversationId",
  as: "messages",
});

ChatMessage.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

User.hasMany(ChatMessage, {
  foreignKey: "senderId",
  as: "sentMessages",
});

ChatMessage.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});



export {
  User,
  Category,
  Product,
  ProductVariant,
  Inventory,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,  
  Conversation, 
  ChatMessage,
};