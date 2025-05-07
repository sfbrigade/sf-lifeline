
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI';

/**
 *
 * @returns {{
 *  mutate: (hospital: object) => Promise<void>
 *  isPending: boolean
 * }}
 */
export function useCreateHospital () {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['createHospital'],
    mutationFn: async (hospital) => {
      const res = await LifelineAPI.createHospital(hospital);
      if (res.status >= 300) {
        const { message } = await res.json();
        return new Error (message);
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the physicians list
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
    onError: (error) => {
      console.error('Failed to create Hospital:', error);
    },
  });

  return { mutateAsync, isPending };
}
