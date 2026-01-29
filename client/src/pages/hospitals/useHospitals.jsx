import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from '#app/LifelineAPI';

const HOSPITALS_TABLE_HEADERS = [
  { key: 'name', text: 'Name' },
  { key: 'email', text: 'Email' },
  { key: 'phone', text: 'Phone' },
  { key: 'address', text: 'Address' },
  { key: 'more', text: '' },
];

/**
 * Hospitals data
 * @typedef {object} Hospitals
 * @property {string} id - Hospitals ID
 * @property {string} address - Hospitals first name, middle name and last name
 * @property {string} email - Hospitals email
 * @property {string} phone - Hospitals phone
 * @
 */

/**
 * Table headers
 * @typedef {object} TableHeader
 * @property {string} key - Table header key corresponding to the data key
 * @property {string} text - Table header text to be displayed
 */

/**
 *
 * @returns {{
 *  Hospitals: Array<Hospitals>,
 *  headers: Array<TableHeader>,
 *  search: string,
 *  setSearch: (search: string) => void,
 *  page: number,
 *  setPage: (page: number) => void,
 *  pages: number,
 *  isFetching: boolean,
 * }}
 */
export function useHospitals () {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ['hospitals', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getHospitals(search, '', page);

      if (res.status !== 200) {
        throw new Error('Failed to fetch Hospitals.');
      }

      const data = await res.json();
      const pages = +res.headers.get('X-Total-Pages');

      return { data, pages };
    },
    select: (res) => ({
      hospitals: res.data.map((hospital) => {
        return {
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
          address: hospital.address,
          phone: hospital.phone,

        };
      }),
      pages: res.pages

    }),
  });

  return {
    hospitals: data?.hospitals,
    headers: HOSPITALS_TABLE_HEADERS,
    search,
    setSearch,
    page,
    setPage,
    pages: data?.pages,
    isFetching,
  };
}
