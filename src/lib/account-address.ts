/** Saved shipping / billing address for signed-in shoppers. */

export type SavedAddress = {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export function emptyAddress(makeDefault = false): SavedAddress {
  return {
    id: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    isDefaultShipping: makeDefault,
    isDefaultBilling: makeDefault,
  };
}

export function formatAddressLines(address: SavedAddress): string[] {
  const lines = [
    `${address.firstName} ${address.lastName}`.trim(),
    address.address1,
    address.address2,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);
  return lines;
}
