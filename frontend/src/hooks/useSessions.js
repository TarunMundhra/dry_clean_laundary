import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await axiosInstance.get("marketplace/sessions/");
      // Handle both list and paginated payloads safely.
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.results)) return res.data.results;
      return [];
    },
    initialData: [],
  });
};
