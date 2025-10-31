import { useQuery } from '@tanstack/react-query';

import LifelineAPI from '#app/LifelineAPI.js';
import { formatPhysicianName } from '../../../../physicians/usePhysicians.jsx';

const formatQueryKey = (excludeIds) => {
  if (!excludeIds?.length) {
    return 'none';
  }

  return [...excludeIds].sort().join(',');
};

/**
 * Fetch physicians that can be linked to a hospital.
 * @param {string} search
 * @param {number} page
 * @param {Array<string>} excludeIds
 * @returns {{ physicians: Array<object>, pages: number, isFetching: boolean, isLoading: boolean }}
 */
export function useAvailablePhysicians (search, page, excludeIds) {
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['availablePhysicians', search, page, formatQueryKey(excludeIds)],
    queryFn: async () => {
      const response = await LifelineAPI.getPhysicians(search, '', page);

      if (response.status !== 200) {
        throw new Error('Failed to fetch physicians.');
      }

      const physicians = await response.json();
      const pages = +response.headers.get('X-Total-Pages');

      return { physicians, pages };
    },
    select: (res) => {
      const excludeSet = new Set(excludeIds ?? []);

      return {
        physicians: res.physicians
          .filter((entry) => !excludeSet.has(entry.id))
          .map((entry) => ({
            id: entry.id,
            name: formatPhysicianName(entry),
            email: entry.email ?? '-',
            phone: entry.phone ?? '-',
          })),
        pages: res.pages,
      };
    },
  });

  return {
    physicians: data?.physicians ?? [],
    pages: data?.pages && data.pages > 0 ? data.pages : 1,
    isFetching,
    isLoading,
  };
}
