import api from "./api";

const cartService = {
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await api.post("/cart", {
      productId,
      quantity,
    });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  removeCartItem: async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  applyCoupon: async (code) => {
    const response = await api.post("/cart/coupon", {
      code,
    });
    return response;
  },

  moveToSavedForLater: async (productId) => {
    const response = await api.post(
      `/cart/save-for-later/${productId}`
    );
    return response;
  },

  moveToCart: async (productId) => {
    const response = await api.post(
      `/cart/move-to-cart/${productId}`
    );
    return response;
  },
};

export default cartService;