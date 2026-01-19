import { watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'

import { useProductsStore } from '@/stores/products.store'
import {
  fetchProducts,
  createProduct,
  updateProductById,
  deleteProductById,
} from '@/services/product.service'
import type { Product } from '@/interfaces/products.interface'

/**
 * API de composición para la gestión de productos.
 * - Sincroniza el catálogo remoto con el store y reutiliza la caché de Vue Query.
 * - Expone mutaciones CRUD que actualizan el store local y luego invalidan la query `products` para asegurar consistencia.
 */
export const useProducts = () => {
  const store = useProductsStore()
  const { products, selectedProduct } = storeToRefs(store)
  const queryClient = useQueryClient()

  // Fetch products
  const { isLoading, data, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: Infinity,
  })

  // Clave de consulta que deseas invalidar
  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  // Sincronizar el resultado con el store
  const syncProducts = (result?: Product[]) => {
    if (Array.isArray(result)) {
      store.setProducts(result)
    } else {
      console.warn('Data is not an array, skipping store update:', result)
    }
  }

  watch(data, syncProducts)

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      store.addProduct(newProduct)
      invalidateProducts()
    },
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: updateProductById,
    onSuccess: (updatedProduct) => {
      store.updateProduct(updatedProduct)
      invalidateProducts()
    },
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProductById,
    onSuccess: (_, productId) => {
      store.deleteProduct(productId as number)
      invalidateProducts()
    },
  })

  return {
    // Estado
    products,
    selectedProduct,
    isLoading,
    error,

    // Métodos
    setSelectedProduct: store.setSelectedProduct,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
  }
}
