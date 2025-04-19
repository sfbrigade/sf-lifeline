import { useMutation, useQueryClient } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI';

/**
 *
 * @returns {{
 *  mutate: (physicanId: string) => Promise<void>
 *  isPending: boolean
 * }}
 */
export function useDeletePhysician () {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deletePhysican'],
    mutationFn: async (physicanId) => {
      const res = await LifelineAPI.deletePhysician(physicanId);
      if (res.status > 200) {
        throw new Error('Failed to delete patient.');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the physicians list
      queryClient.invalidateQueries({ queryKey: ['physicians'] });
    },
    onError: (error) => {
      console.error('Failed to delete physician:', error);
    },
  });

  return { mutateAsync, isPending };
}
