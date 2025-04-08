import { useMutation, useQueryClient } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI';

/**
 *
 * @returns {{
 *  mutate: (hospitalId: string) => Promise<void>
 *  isPending: boolean
 * }}
 */
export function useDeleteHopsital () {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteHospital'],
    mutationFn: async (hosptialId) => {
      const res = await LifelineAPI.deleteHospital(hosptialId);
      if (!res.status) {
        throw new Error('Failed to delete hospital.');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the physicians list
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
    onError: (error) => {
      console.error('Failed to delete hospital:', error);
    },
  });

  return { mutateAsync, isPending };
}
