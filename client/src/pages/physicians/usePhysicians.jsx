import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI';

const PHYSICIANS_TABLE_HEADERS = [
  { key: 'name', text: 'Name' },
  { key: 'email', text: 'Email' },
  { key: 'phone', text: 'Phone' },
  { key: 'more', text: '' },
];

const formatName = (entry) => {
  const formattedName = `${entry.firstName}${entry.middleName ? ` ${entry.middleName}` : ''} ${entry.lastName}`;
  return formattedName.trim() ? formattedName : '-';
};

/**
 * Physicians data
 * @typedef {object} Physicians
 * @property {string} id - Physicians ID
 * @property {string} name - Physicians first name, middle name and last name
 * @property {string} email - Physicians email
 * @property {string} phone - Physicians phone
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
 *  Physicians: Array<Physicians>,
 *  headers: Array<TableHeader>,
 *  search: string,
 *  setSearch: (search: string) => void,
 *  page: number,
 *  setPage: (page: number) => void,
 *  pages: number,
 *  isFetching: boolean,
 * }}
 */
export function usePhysicians () {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ['physicians', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getPhysicians(search, page);

      if (res.status !== 200) {
        throw new Error('Failed to fetch patients.');
      }

      const data = await res.json();
      const pages = +res.headers.get('X-Total-Pages');

      return { data, pages };
    },
    select: (res) => ({
      physicians: res.data.map((physicians) => {
        return {
          id: physicians.id,
          name: formatName(physicians),
          email: physicians.email,
          phone: physicians.phone,

        };
      }),
      pages: res.pages

    }),
  });

  return {
    physicians: data?.physicians,
    headers: PHYSICIANS_TABLE_HEADERS,
    search,
    setSearch,
    page,
    setPage,
    pages: data?.pages,
    isFetching,
  };
}
