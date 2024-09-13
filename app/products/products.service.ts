import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Product } from './product.class';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    private url: string = "http://localhost:8080";
    private static productslist: Product[] = null;
    private products$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);

    constructor(private http: HttpClient) { }

    generateUniqueId(): number {
        return Math.floor(1000 + Math.random() * 9000);
    }

    getProducts(page:number,limit:number): Observable<Product[]> {
        if (!ProductsService.productslist) {
            this.http.get<any>(this.url+`/products?page=${page}&limit=${limit}`).subscribe(data => {
                ProductsService.productslist = [...data];
                this.products$.next(ProductsService.productslist);
            });
        }
        else {
            this.products$.next(ProductsService.productslist);
        }

        return this.products$;
    }

    create(prod: Product): Observable<any> {
        const newId = this.generateUniqueId();
        prod.id = newId;
        return this.http.post<Product>(this.url+`/products`, prod).pipe(
            tap((newProduct: Product) => {
                ProductsService.productslist.push(newProduct["data"]);
                this.products$.next(ProductsService.productslist);
            }),
            map(() => ProductsService.productslist)
        );
    }




    update(prod: Product): Observable<any> {
        return this.http.put<Product>(this.url+`/products/updateProductById/${prod.id}`, prod).pipe(
            tap((updatedProduct: Product) => {
                ProductsService.productslist = ProductsService.productslist.map(element =>
                    element.id === updatedProduct.id ? updatedProduct : element
                );
                this.products$.next(ProductsService.productslist);
            }),
            catchError(error => {
                console.error('Error occurred during update operation:', error);
                return of(ProductsService.productslist);
            })
        );
    }




    delete(id: number): Observable<Product[]> {
        return this.http.delete<void>(this.url+`/products/deleteProductById/${id}`).pipe(
            map(() => ProductsService.productslist),
            catchError(error => {
                ProductsService.productslist = ProductsService.productslist.filter(value => value.id !== id);
                this.products$.next(ProductsService.productslist);
                return of(ProductsService.productslist);
            })
        );
    }


}