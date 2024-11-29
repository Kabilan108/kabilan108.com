import { create } from "zustand";

import { apiClient } from "./api-client";
import type { Post, Profile, Project, Resume } from "./types";

export interface DataStore {
  profile: Profile | null;
  posts: Post[] | null;
  projects: Project[] | null;
  resume: Resume | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useDataStore = create<DataStore>((set) => ({
  profile: null,
  posts: null,
  projects: null,
  resume: null,
  loading: false,
  error: null,
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [profile, posts, projects, resume] = await Promise.all([
        apiClient.getProfile(),
        apiClient.getPosts(),
        apiClient.getProjects(),
        apiClient.getResume(),
      ]);
      set({ profile, posts, projects, resume });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
