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
  },

  // product request
  {
    path: 'request-product',
    loadComponent: () =>
      import('./request-product-front/request-product-front.component')
        .then(m => m.RequestProductFrontComponent)
  },
  {
    path: 'my-product-requests',
    loadComponent: () =>
      import('./my-product-requests-front/my-product-requests-front.component')
        .then(m => m.MyProductRequestsFrontComponent)
  },
  {
    path: 'my-product-requests/:id',
    loadComponent: () =>
      import('./product-request-detail-front/product-request-detail-front.component')
        .then(m => m.ProductRequestDetailFrontComponent)
  }
  ,
  {
  path: 'seller/product-requests',
  loadComponent: () =>
    import('./seller-product-requests-front/seller-product-requests-front.component')
      .then(m => m.SellerProductRequestsFrontComponent)
},
{
  path: 'seller/product-requests/:id/respond',
  loadComponent: () =>
    import('./seller-request-offer-form-front/seller-request-offer-form-front.component')
      .then(m => m.SellerRequestOfferFormFrontComponent)
},
{
  path: 'seller/my-request-offers',
  loadComponent: () =>
    import('./seller-my-request-offers-front/seller-my-request-offers-front.component')
      .then(m => m.SellerMyRequestOffersFrontComponent)
}
];