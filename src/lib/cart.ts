import type {
  Cart,
  CartItem,
  CartTotals,
  Order,
  OrderItem,
  Product,
  RepositoryState,
  ShippingAddress,
} from "../types/petcare";
import { type Actor, AuthorizationError } from "./authorization";
import { createId, PetCareRepository } from "./repository";
import {
  cartItemInputSchema,
  checkoutSchema,
  type CartItemInput,
  type CheckoutInput,
} from "./validation";

export class CartError extends Error {
  public readonly statusCode: number;

  public constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CartError";
    this.statusCode = statusCode;
  }
}

export interface DeliveryPolicy {
  fee: number;
  freeDeliveryThreshold: number;
}

export const DEFAULT_DELIVERY_POLICY: DeliveryPolicy = {
  fee: 79,
  freeDeliveryThreshold: 999,
};

function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function discountedUnitPrice(product: Product): number {
  return money(product.price * (1 - product.discountPercent / 100));
}

function activeProductMap(products: Product[]): Map<string, Product> {
  return new Map(
    products.filter((product) => product.isActive).map((product) => [product.id, product]),
  );
}

/**
 * Product prices are tax-inclusive mock prices. The subtotal is pre-discount;
 * discount and delivery are shown independently to make checkout transparent.
 */
export function calculateCartTotals(
  cart: Cart,
  products: Product[],
  deliveryPolicy: DeliveryPolicy = DEFAULT_DELIVERY_POLICY,
): CartTotals {
  const productById = activeProductMap(products);
  const lines = cart.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new CartError("One of the products in your cart is no longer available.", 409);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new CartError("Cart quantities must be positive whole numbers.");
    }

    const lineSubtotal = money(product.price * item.quantity);
    const unitPrice = discountedUnitPrice(product);
    const lineTotal = money(unitPrice * item.quantity);
    return {
      item: { ...item },
      product: { ...product },
      unitPrice,
      lineSubtotal,
      lineDiscount: money(lineSubtotal - lineTotal),
      lineTotal,
    };
  });

  const subtotal = money(lines.reduce((sum, line) => sum + line.lineSubtotal, 0));
  const discount = money(lines.reduce((sum, line) => sum + line.lineDiscount, 0));
  const merchandiseTotal = money(subtotal - discount);
  const deliveryFee =
    merchandiseTotal === 0 || merchandiseTotal >= deliveryPolicy.freeDeliveryThreshold
      ? 0
      : money(deliveryPolicy.fee);

  return {
    lines,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    discount,
    deliveryFee,
    total: money(merchandiseTotal + deliveryFee),
  };
}

function assertCanUseCart(actor: Actor): void {
  if (!actor.isActive || (actor.role !== "PET_OWNER" && actor.role !== "ADMIN")) {
    throw new AuthorizationError("Only an active pet owner can manage a cart.");
  }
}

function cartForOwner(
  state: RepositoryState,
  ownerId: string,
  timestamp: string,
): Cart {
  const existing = state.carts.find((cart) => cart.ownerId === ownerId);
  if (existing) {
    return existing;
  }
  const cart: Cart = {
    id: createId("cart"),
    ownerId,
    items: [],
    updatedAt: timestamp,
  };
  state.carts.push(cart);
  return cart;
}

function requireProduct(
  state: RepositoryState,
  productId: string,
): Product {
  const product = state.products.find((candidate) => candidate.id === productId);
  if (!product || !product.isActive) {
    throw new CartError("This product is no longer available.", 404);
  }
  return product;
}

function verifyStock(product: Product, quantity: number): void {
  if (product.stock < quantity) {
    throw new CartError(
      "Only " + product.stock + " item(s) of " + product.name + " are available.",
      409,
    );
  }
}

function createOrderItems(totals: CartTotals): OrderItem[] {
  return totals.lines.map((line) => ({
    id: createId("order-item"),
    productId: line.product.id,
    productName: line.product.name,
    quantity: line.item.quantity,
    unitPrice: line.unitPrice,
    discountPercent: line.product.discountPercent,
    lineTotal: line.lineTotal,
  }));
}

function mockOrderNumber(timestamp: Date): string {
  return (
    "PCH-" +
    timestamp.toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    createId("order").slice(-6).toUpperCase()
  );
}

export interface CartServiceOptions {
  now?: () => Date;
  deliveryPolicy?: DeliveryPolicy;
}

export class CartService {
  private readonly clock: () => Date;
  private readonly deliveryPolicy: DeliveryPolicy;

  public constructor(
    private readonly repository: PetCareRepository,
    options: CartServiceOptions = {},
  ) {
    this.clock = options.now ?? (() => new Date());
    this.deliveryPolicy = options.deliveryPolicy ?? DEFAULT_DELIVERY_POLICY;
  }

  public getCart(actor: Actor): Cart {
    assertCanUseCart(actor);
    return this.repository.transaction((draft) =>
      cartForOwner(draft, actor.id, this.clock().toISOString()),
    );
  }

  public getTotals(actor: Actor): CartTotals {
    const cart = this.getCart(actor);
    return calculateCartTotals(cart, this.repository.listProducts(), this.deliveryPolicy);
  }

  public addItem(actor: Actor, input: CartItemInput): Cart {
    assertCanUseCart(actor);
    const parsed = cartItemInputSchema.parse(input);
    const now = this.clock().toISOString();
    return this.repository.transaction((draft) => {
      const product = requireProduct(draft, parsed.productId);
      const cart = cartForOwner(draft, actor.id, now);
      const existing = cart.items.find((item) => item.productId === parsed.productId);
      const nextQuantity = (existing?.quantity ?? 0) + parsed.quantity;
      verifyStock(product, nextQuantity);

      if (existing) {
        existing.quantity = nextQuantity;
      } else {
        const item: CartItem = {
          id: createId("cart-item"),
          productId: parsed.productId,
          quantity: parsed.quantity,
          addedAt: now,
        };
        cart.items.push(item);
      }
      cart.updatedAt = now;
      return cart;
    });
  }

  public updateQuantity(
    actor: Actor,
    input: CartItemInput,
  ): Cart {
    assertCanUseCart(actor);
    const parsed = cartItemInputSchema.parse(input);
    const now = this.clock().toISOString();
    return this.repository.transaction((draft) => {
      const product = requireProduct(draft, parsed.productId);
      verifyStock(product, parsed.quantity);
      const cart = cartForOwner(draft, actor.id, now);
      const item = cart.items.find((candidate) => candidate.productId === parsed.productId);
      if (!item) {
        throw new CartError("That product is not in your cart.", 404);
      }
      item.quantity = parsed.quantity;
      cart.updatedAt = now;
      return cart;
    });
  }

  public removeItem(actor: Actor, productId: string): Cart {
    assertCanUseCart(actor);
    const now = this.clock().toISOString();
    return this.repository.transaction((draft) => {
      const cart = cartForOwner(draft, actor.id, now);
      const initialCount = cart.items.length;
      cart.items = cart.items.filter((item) => item.productId !== productId);
      if (initialCount === cart.items.length) {
        throw new CartError("That product is not in your cart.", 404);
      }
      cart.updatedAt = now;
      return cart;
    });
  }

  public clear(actor: Actor): Cart {
    assertCanUseCart(actor);
    const now = this.clock().toISOString();
    return this.repository.transaction((draft) => {
      const cart = cartForOwner(draft, actor.id, now);
      cart.items = [];
      cart.updatedAt = now;
      return cart;
    });
  }

  public checkout(actor: Actor, input: CheckoutInput): Order {
    assertCanUseCart(actor);
    const address = checkoutSchema.parse(input) as ShippingAddress;
    const checkoutTime = this.clock();
    const timestamp = checkoutTime.toISOString();

    return this.repository.transaction((draft) => {
      const cart = cartForOwner(draft, actor.id, timestamp);
      if (cart.items.length === 0) {
        throw new CartError("Your cart is empty.", 409);
      }
      for (const item of cart.items) {
        const product = requireProduct(draft, item.productId);
        verifyStock(product, item.quantity);
      }

      const totals = calculateCartTotals(cart, draft.products, this.deliveryPolicy);
      const order: Order = {
        id: createId("order"),
        orderNumber: mockOrderNumber(checkoutTime),
        ownerId: actor.id,
        items: createOrderItems(totals),
        subtotal: totals.subtotal,
        discount: totals.discount,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        shippingAddress: address,
        paymentReference: "mock_payment_" + createId("payment"),
        status: "PLACED",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      for (const item of cart.items) {
        const product = requireProduct(draft, item.productId);
        product.stock -= item.quantity;
        product.updatedAt = timestamp;
      }
      cart.items = [];
      cart.updatedAt = timestamp;
      draft.orders.push(order);
      draft.notifications.push({
        id: createId("notification"),
        ownerId: actor.id,
        title: "Order placed",
        body: "Your order " + order.orderNumber + " has been placed.",
        href: "/orders/" + order.id,
        createdAt: timestamp,
      });
      return order;
    });
  }
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
