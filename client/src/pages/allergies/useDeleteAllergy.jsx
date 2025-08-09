import { useMutation, useQueryClient } from '@tanstack/react-query';
import LifelineAPI from '#app/LifelineAPI';

/**
 *
 * @returns {{
 *  mutate: (allergylId: string) => Promise<void>
 *  isPending: boolean
 * }}
 */
export function useDeleteAllergy () {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteAllergy'],
    mutationFn: async (allergyId) => {
      const res = await LifelineAPI.deleteAllergy(allergyId);
      if (!res.status) {
        throw new Error('Failed to delete allergy.');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the physicians list
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
    onError: (error) => {
      console.error('Failed to delete allergy:', error);
    },
  });

  return { mutateAsync, isPending };
}
