import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "./dashboard.service";

export const dashboardQueryKey =
["admin", "dashboard"];

export const useDashboard = () => {
return useQuery({
queryKey: dashboardQueryKey,
queryFn: getDashboard,
staleTime: 30 * 1000,
retry: 1,
});
};