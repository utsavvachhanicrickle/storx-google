import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectService, Project } from "../../services/projectService";

export const fetchProjects = createAsyncThunk(
  "project/fetchProjects",
  async (_, thunkAPI) => {
    try {
      const response = await projectService.getProjects();
      
      // Defensively parse envelope:
      let projectsList: any[] = [];
      if (Array.isArray(response)) {
        projectsList = response;
      } else if (response && typeof response === "object") {
        projectsList =
          response.projects ??
          response.Projects ??
          response.data ??
          response.Data ??
          response.success ??
          response.Success ??
          [];
        if (!Array.isArray(projectsList)) projectsList = [];
      }
      return projectsList;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch projects";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
