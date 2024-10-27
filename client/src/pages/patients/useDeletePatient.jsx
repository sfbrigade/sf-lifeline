import { useMutation, useQueryClient } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI';


export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientId) => {
      const res = await LifelineAPI.deletePatient(patientId);
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
    }
  });
}