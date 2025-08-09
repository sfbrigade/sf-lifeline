import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from '#app/LifelineAPI';

const ALLERGIES_TABLE_HEADERS = [
  { key: 'name', text: 'Name' },
  { key: 'type', text: 'Type' },
];

/**
 * Allergies data
 * @typedef {object} Allergies
 * @property {string} id - Allergies ID
 * @property {string} name - Allergies name
 * @property {string} type - Allergies type
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
 *  Allergies: Array<Allergies>,
 *  headers: Array<TableHeader>,
 *  search: string,
 *  setSearch: (search: string) => void,
 *  page: number,
 *  setPage: (page: number) => void,
 *  pages: number,
 *  isFetching: boolean,
 * }}
 */
export function useAllergies () {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ['allergies', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getAllergies(search, page);
      if (res.status !== 200) {
        throw new Error('Failed to fetch Allergies.');
      }

      const data = await res.json();
      const pages = +res.headers.get('X-Total-Pages');
      return { data, pages };
    },
    select: (res) => ({
      allergies: res.data.map((allergy) => {
        return {
          id: allergy.id,
          name: allergy.name,
          type: allergy.type,
        };
      }),
      pages: res.pages

    }),
  });

  return {
    allergies: data?.allergies,
    headers: ALLERGIES_TABLE_HEADERS,
    search,
    setSearch,
    page,
    setPage,
    pages: data?.pages,
    isFetching,
  };
}
