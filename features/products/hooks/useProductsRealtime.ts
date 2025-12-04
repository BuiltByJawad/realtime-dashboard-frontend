'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Product } from '@/features/products/types';

interface UseProductsRealtimeResult {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

function mapDocToProduct(doc: DocumentData): Product {
    const data = doc.data();

    const createdAtRaw = data.createdAt;
    const updatedAtRaw = data.updatedAt;

    const createdAt = createdAtRaw instanceof Timestamp ? createdAtRaw.toDate().toISOString() : createdAtRaw ?? new Date().toISOString();
    const updatedAt = updatedAtRaw instanceof Timestamp ? updatedAtRaw.toDate().toISOString() : updatedAtRaw ?? createdAt;

    return {
        id: doc.id,
        name: data.name,
        price: data.price,
        status: data.status,
        category: data.category,
        stock: data.stock,
        createdAt,
        updatedAt,
    };
}

export function useProductsRealtime(initialProducts: Product[] = [],): UseProductsRealtimeResult {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        const productsRef = collection(db, 'products');
        // Keep the same ordering as the backend (createdAt desc)
        const productsQuery = query(productsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(
            productsQuery,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const next: Product[] = snapshot.docs.map((doc) => mapDocToProduct(doc));
                setProducts(next);
                setLoading(false);
            },
            (err) => {
                console.error('Realtime products error', err);
                setError(err);
                setLoading(false);
            },
        );

        return () => {
            unsubscribe();
        };
    }, []);

    return { products, loading, error };
}