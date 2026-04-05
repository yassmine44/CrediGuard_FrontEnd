import { Routes } from '@angular/router';

export const ECOMMERCE_FRONT_ROUTES: Routes = [
  {
    path: 'ecommerce',
    loadComponent: () =>
      import('./ecommerce-front/ecommerce-front.component')
        .then(m => m.EcommerceFrontComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./product-detail-front/product-detail-front.component')
        .then(m => m.ProductDetailFrontComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./cart/cart.component')
        .then(m => m.CartComponent)
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders-front/orders-front.component')
        .then(m => m.OrdersFrontComponent)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout.component')
        .then(m => m.CheckoutComponent)
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./order-detail-front/order-detail-front.component')
        .then(m => m.OrderDetailFrontComponent)
  },


  // seller side in front office
  {
    path: 'seller/products',
    loadComponent: () =>
      import('./seller-products-front/seller-products-front.component')
        .then(m => m.SellerProductsFrontComponent)
  },
  {
    path: 'seller/products/new',
    loadComponent: () =>
      import('./seller-product-form-front/seller-product-form-front.component')
        .then(m => m.SellerProductFormFrontComponent)
  },
  {
    path: 'seller/products/edit/:id',
    loadComponent: () =>
      import('./seller-product-form-front/seller-product-form-front.component')
        .then(m => m.SellerProductFormFrontComponent)
  }
];