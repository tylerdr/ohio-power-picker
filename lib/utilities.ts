import { Utility } from './types';

export const utilities: Utility[] = [
  {
    id: 'aep-ohio',
    name: 'AEP Ohio',
    serviceArea: 'Columbus area',
    priceToCompare: 0.1049
  },
  {
    id: 'duke-energy-ohio',
    name: 'Duke Energy Ohio',
    serviceArea: 'Cincinnati area',
    priceToCompare: 0.0912
  },
  {
    id: 'ohio-edison',
    name: 'Ohio Edison / FirstEnergy',
    serviceArea: 'Cleveland / Akron area',
    priceToCompare: 0.0995
  },
  {
    id: 'aes-ohio',
    name: 'Dayton Power & Light / AES Ohio',
    serviceArea: 'Dayton area',
    priceToCompare: 0.0898
  },
  {
    id: 'toledo-edison',
    name: 'Toledo Edison / FirstEnergy',
    serviceArea: 'Toledo area',
    priceToCompare: 0.1011
  },
  {
    id: 'illuminating-company',
    name: 'The Illuminating Company / FirstEnergy',
    serviceArea: 'Cleveland area',
    priceToCompare: 0.1034
  }
];

export const utilityMap = Object.fromEntries(
  utilities.map((utility) => [utility.id, utility])
);
