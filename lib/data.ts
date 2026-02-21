import suppliers from '@/data/suppliers.json';
import { Supplier } from './types';

export const supplierData = suppliers as Supplier[];

export const getSuppliersForUtility = (utilityId: string) =>
  supplierData.filter((supplier) => supplier.utilityTerritories.includes(utilityId));
