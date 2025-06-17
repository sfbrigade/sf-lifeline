import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAppContext } from '#app/AppContext.jsx';
import LifelineAPI from '#app/LifelineAPI.js';

const PATIENTS_TABLE_HEADERS_PHI = [
  { key: 'name', text: 'Name' },
  { key: 'more', text: '' },
];

const PATIENTS_TABLE_HEADERS = [
  { key: 'id', text: 'ID' },
  { key: 'more', text: '' },
];

const formatName = (entry) => {
  const formattedName = `${entry.firstName}${entry.middleName ? ` ${entry.middleName}` : ''} ${entry.lastName}`;
  return formattedName.trim() ? formattedName : '-';
};

/**
 * Patient data
 * @typedef {object} Patients
 * @property {string} id - Hospital id
 * @property {string} name - Hospital name
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
 *  Patients: Array<Patient>,
 *  headers: Array<TableHeader>,
 *  search: string,
 *  setSearch: (search: string) => void,
 *  page: number,
 *  setPage: (page: number) => void,
 *  pages: number,
 *  isFetching: boolean,
 * }}
 */
export function usePhysicanPatients (physicianId) {
  const { env } = useAppContext();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getPhysicianPatients(search, page, physicianId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch patients.');
      }

      const data = await res.json();
      const pages = +res.headers.get('X-Total-Pages');

      return { data, pages };
    },
    select: (res) => ({
      patients: res.data.map((patient) => {
        return {
          id: patient.id,
          name: formatName(patient),
        };
      }),
      pages: res.pages

    }),
  });

  return {
    patients: data?.patients,
    headers: env.FEATURE_COLLECT_PHI ? PATIENTS_TABLE_HEADERS_PHI : PATIENTS_TABLE_HEADERS,
    search,
    setSearch,
    page,
    setPage,
    pages: data?.pages,
    isFetching,
  };
}
