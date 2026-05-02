import { Routes } from '@angular/router';
export const ECOMMERCE_ADMIN_ROUTES: Routes = [
  {
    path: 'ecommerce',
    loadComponent: () =>
      import('./ecommerce.component')
        .then(m => m.EcommerceComponent)
  },
  {
    path: 'ecommerce/categories',
    loadComponent: () =>
      import('./categories-admin/categories-admin.component')
        .then(m => m.CategoriesAdminComponent)
  },
  {
    path: 'ecommerce/products',
    loadComponent: () =>
      import('./products-admin/products-admin.component')
        .then(m => m.ProductsAdminComponent)
  },
  {
    path: 'ecommerce/products/new',
    loadComponent: () =>
      import('./product-form-admin/product-form-admin.component')
        .then(m => m.ProductFormAdminComponent)
  },
  {
    path: 'ecommerce/products/edit/:id',
    loadComponent: () =>
      import('./product-form-admin/product-form-admin.component')
        .then(m => m.ProductFormAdminComponent)
  },
  {
    path: 'ecommerce/orders',
    loadComponent: () =>
      import('./orders-admin/orders-admin.component')
        .then(m => m.OrdersAdminComponent)
  },
  {
    path: 'ecommerce/promo-codes',
    loadComponent: () =>
      import('./promo-codes-admin/promo-codes-admin.component')
        .then(m => m.PromoCodesAdminComponent)
  },
  {
    path: 'ecommerce/payments',
    loadComponent: () =>
      import('./payments-admin/payments-admin.component')
        .then(m => m.PaymentsAdminComponent)
  },
  {
    path: 'ecommerce/deliveries',
    loadComponent: () =>
      import('./deliveries-admin/deliveries-admin.component')
        .then(m => m.DeliveriesAdminComponent)
  },
{
  path: 'ecommerce/finance-dashboard',
  loadComponent: () =>
    import('./ecommerce-finance-dashboard/ecommerce-finance-dashboard.component')
      .then(m => m.EcommerceFinanceDashboardComponent)
},
{
  path: 'ecommerce/calendar-events',
  loadComponent: () =>
    import('./calendar-events-admin/calendar-events-admin.component')
      .then(m => m.CalendarEventsAdminComponent)
},
{
  path: 'ecommerce/promotions',
  loadComponent: () =>
    import('./promotions-admin/promotions-admin.component')
      .then(m => m.PromotionsAdminComponent)
}
,
{
  path: 'ecommerce/product-requests',
  loadComponent: () =>
    import('./admin/product-requests-admin/admin-product-requests/admin-product-requests.component')
      .then(m => m.AdminProductRequestsComponent)
},
{
  path: 'ecommerce/product-requests/:id',
  loadComponent: () =>
    import('./admin/product-requests-admin/admin-product-request-detail/admin-product-request-detail.component')
      .then(m => m.AdminProductRequestDetailComponent)
},
{
  path: 'ecommerce/product-intelligence',
  loadComponent: () =>
    import('./product-intelligence-admin/product-intelligence-admin.component')
      .then(m => m.ProductIntelligenceAdminComponent)
}
];

