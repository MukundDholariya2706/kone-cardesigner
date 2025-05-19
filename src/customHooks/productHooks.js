import { useContext } from 'react';
import { ProductContext } from '../../store/product';
import { createServiceReadMoreUrlGetter } from '../product-utils';

export function useServiceReadMoreURL(serviceId) {
  const { product } = useContext(ProductContext)
  const getUrl = createServiceReadMoreUrlGetter(product)
  return getUrl(serviceId)
}