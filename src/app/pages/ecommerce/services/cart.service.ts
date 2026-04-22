import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AddItemRequest, Cart, UpdateItemRequest } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8089/api/cart';

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  private itemsCountSubject = new BehaviorSubject<number>(0);
  itemsCount$ = this.itemsCountSubject.asObservable();

  getMyCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/me`).pipe(
      tap((cart) => this.setCartState(cart))
    );
  }

  addItem(payload: AddItemRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, payload).pipe(
      tap((cart) => this.setCartState(cart))
    );
  }

  updateItem(itemId: number, payload: UpdateItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, payload).pipe(
      tap((cart) => this.setCartState(cart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap((cart) => this.setCartState(cart))
    );
  }

  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/clear`).pipe(
      tap((cart) => this.setCartState(cart))
    );
  }

  setCartState(cart: Cart | null): void {
    this.cartSubject.next(cart);
    this.itemsCountSubject.next(this.computeItemsCount(cart));
  }

  resetCartState(): void {
    this.cartSubject.next(null);
    this.itemsCountSubject.next(0);
  }

  getCartSnapshot(): Cart | null {
    return this.cartSubject.value;
  }

  getItemsCountSnapshot(): number {
    return this.itemsCountSubject.value;
  }

  private computeItemsCount(cart: Cart | null): number {
    if (!cart?.items?.length) {
      return 0;
    }

    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}