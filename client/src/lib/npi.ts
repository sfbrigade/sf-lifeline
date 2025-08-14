import type { Hospital } from '../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function formatAddress(address: any): string {
  const parts = [
    address.address_1,
    address.address_2,
    address.city,
    address.state,
    address.postal_code ? address.postal_code.substring(0, 5) : '',
  ].filter(Boolean);
  return parts.join(', ');
}

export async function searchHospitalsNPI({
  name,
  city,
  state,
  limit = 25,
}: {
  name: string;
  city?: string;
  state?: string;
  limit?: number;
}): Promise<Hospital[]> {
  try {
    const params = new URLSearchParams({
      version: '2.1',
      limit: String(limit),
      taxonomy_description: 'Hospital',
      organization_name: name,
    });
    if (city) params.append('city', city);
    if (state) params.append('state', state);

    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`NPI API error: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((result: any) => {
      const locationAddress =
        result.addresses?.find(
          (addr: any) => addr.address_purpose === 'LOCATION'
        ) || result.addresses?.[0];

      return {
        id: String(result.number),
        name: result.basic.organization_name,
        address: locationAddress ? formatAddress(locationAddress) : 'N/A',
        phone: locationAddress?.telephone_number || undefined,
      };
    });
  } catch (error) {
    console.error('Error searching NPI hospitals:', error);
    throw error;
  }
}
