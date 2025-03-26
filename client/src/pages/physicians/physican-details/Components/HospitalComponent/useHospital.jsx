import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from '../../../LifelineAPI.js';

const PHYSICIANS_TABLE_HEADERS = [
  { key: 'name', text: 'Name' },
  { key: 'more', text: '' },
];

/**
 * Patient data
 * @typedef {object} Hospital
 * @property {string} id - Hospital id
 * @property {string} name - Hospital name
 * @property {string} address - Hospital address
 * @property {string} phone - Hospital phone
 * @property {string} email - Hospital email
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
 *  Hospitals: Array<Hospital>,
 *  headers: Array<TableHeader>,
 *  search: string,
 *  setSearch: (search: string) => void,
 *  page: number,
 *  setPage: (page: number) => void,
 *  pages: number,
 *  isFetching: boolean,
 * }}
 */
export function useHospitals (physicianId) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ['hospital', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getPhysicianInHospital(search, page, physicianId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch patients.');
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
          phone: hospital.phone,

        };
      }),
      pages: res.pages

    }),
  });
  return {
    hospitals: data?.hospitals,
    headers: PHYSICIANS_TABLE_HEADERS,
    search,
    setSearch,
    page,
    setPage,
    pages: data?.pages,
    isFetching,
  };
}
