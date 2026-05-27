import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-provider";
import { supabase } from "@/integrations/supabase/client";

export type BodyMetric = {
  metric_date: string;
  weight_kg: number;
};

export const useProgressMetrics = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["progress-metrics", userId],
    enabled: Boolean(userId),
    queryFn: () => apiFetch<{ metrics: BodyMetric[] }>(`/progress/metrics/${userId}?limit=30`),
  });
};

export const useProgressPhotos = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["progress-photos", userId],
    enabled: Boolean(userId),
    queryFn: () => apiFetch<{ photos: Array<{ id: string; photo_path: string; shot_date: string }> }>(
      `/progress/photos/${userId}`,
    ),
  });
};

export const useProgressActions = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["progress-metrics", userId] });
    void queryClient.invalidateQueries({ queryKey: ["progress-photos", userId] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary", userId] });
  };

  const saveWeightMutation = useMutation({
    mutationFn: (weightKg: number) =>
      apiFetch("/progress/metrics", {
        method: "POST",
        body: JSON.stringify({ userId, weightKg }),
      }),
    onSuccess: invalidate,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) {
        throw new Error("No user");
      }
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("progress-photos").upload(path, file, {
        upsert: false,
      });
      if (error) {
        throw error;
      }
      return apiFetch("/progress/photos", {
        method: "POST",
        body: JSON.stringify({ userId, photoPath: path }),
      });
    },
    onSuccess: invalidate,
  });

  return { saveWeightMutation, uploadPhotoMutation };
};
