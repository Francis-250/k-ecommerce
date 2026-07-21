export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options?: Record<string, string>;
};

export type AddCartItem = Omit<CartItem, "id" | "quantity"> & {
  quantity?: number;
};
