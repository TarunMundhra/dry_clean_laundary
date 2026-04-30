import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

export const useBookings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId) => {
      return await axiosInstance.post("marketplace/bookings/", {
        session: sessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
  });
};
