import { useMutation, useQueryClient } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI';

/**
 *
 * @returns {{
 *  mutate: (physicanId: string) => Promise<void>
 *  isPending: boolean
 * }}
 */
export function useDeletePhysicians () {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deletePhysicans'],
    mutationFn: async (physicanId) => {
      const res = await LifelineAPI.deletePhysicians(physicanId);
      if (!res.status) {
        throw new Error('Failed to delete patient.');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Failed to delete patient:', error);
    },
  });

  return { mutateAsync, isPending };
}
