import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI';
import dayjs from 'dayjs';

const PATIENT_TABLE_HEADERS = [
  { key: 'name', text: 'Name' },
  { key: 'createdBy', text: 'Created by' },
  { key: 'createdAt', text: 'Date created' },
  { key: 'updatedBy', text: 'Updated by' },
  { key: 'updatedAt', text: 'Last updated' },
  { key: 'more', text: '' },
];

const formatName = (entry) => {
  const formattedName = `${entry.firstName}${entry.middleName ? ` ${entry.middleName}` : ''} ${entry.lastName}`;
  return formattedName.trim() ? formattedName : '-';
};

/**
 * Patient data
 * @typedef {object} Patient
 * @property {string} id - Patient ID
 * @property {string} name - Patient first name, middle name and last name
 * @property {string} createdBy - Lifeline user first name, middle name and last name
 * @property {string} createdAt - Date patient profile was created
 * @property {string} updatedBy - Lifeline user first name, middle name and last name
 * @property {string} updatedAt - Date patient profile was last updated
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
 *  patients: Array<Patient>,
 *  headers: Array<TableHeader>,
 *  search: string,
 *  setSearch: (search: string) => void,
 *  page: number,
 *  setPage: (page: number) => void,
 *  pages: number,
 *  isFetching: boolean,
 * }}
 */
export function usePatients () {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getPatients(search, page);

      if (!res.status) {
        throw new Error('Failed to fetch patients.');
      }
      const data = await res.json();
      const pages = +res.headers.get('X-Total-Pages');
      return { data, pages };
    },
    select: (res) => ({
      patients: res.data.map((patient) => ({
        id: patient.id,
        name: formatName(patient),
        createdBy: formatName(patient.createdBy),
        createdAt: dayjs(patient.createdAt).format('MMMM D, YYYY'),
        updatedBy: formatName(patient.updatedBy),
        updatedAt: dayjs(patient.updatedAt).format('MMMM D, YYYY'),
      })),
      pages: res.pages,
    }),
  });

  return {
    patients: data?.patients,
    headers: PATIENT_TABLE_HEADERS,
    search,
    setSearch,
    page,
    setPage,
    pages: data?.pages,
    isFetching,
  };
}
