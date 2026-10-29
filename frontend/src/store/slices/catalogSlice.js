import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const STORAGE_KEY = 'academic_catalog_cache';

// Helper to safely load cached catalog from localStorage
function getInitialCatalogCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
        books: Array.isArray(parsed.books) ? parsed.books : [],
        lastFetched: parsed.lastFetched || null
      };
    }
  } catch (err) {
    console.warn('[Redux Catalog] Failed to read cached catalog:', err);
  }
  return { subjects: [], books: [], lastFetched: null };
}

const initialCache = getInitialCatalogCache();

export const fetchCatalogData = createAsyncThunk(
  'catalog/fetchCatalogData',
  async (options = {}, { rejectWithValue, getState }) => {
    const force = Boolean(options.force);
    const { catalog } = getState();

    // Cache TTL: 60 seconds unless force is requested
    const now = Date.now();
    if (!force && catalog.lastFetched && (now - catalog.lastFetched < 60000) && catalog.subjects.length > 0) {
      return {
        subjects: catalog.subjects,
        books: catalog.books,
        fromCache: true,
        dbConnected: true
      };
    }

    try {
      const timestamp = Date.now();
      const [subjectsRes, booksRes] = await Promise.all([
        fetch(`/api/subjects?t=${timestamp}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }),
        fetch(`/api/books?t=${timestamp}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        })
      ]);

      const subjectsData = await subjectsRes.json().catch(() => ({ success: false, data: [] }));
      const booksData = await booksRes.json().catch(() => ({ success: false, data: [] }));

      const subjects = Array.isArray(subjectsData.data) ? subjectsData.data : [];
      const books = Array.isArray(booksData.data) ? booksData.data : [];

      const isSubjectsOk = subjectsRes.ok && subjectsData.success !== false;
      const isBooksOk = booksRes.ok && booksData.success !== false;

      if (!isSubjectsOk && !isBooksOk) {
        return rejectWithValue({
          message: subjectsData.message || booksData.message || 'Database connection unreachable',
          dbConnected: false
        });
      }

      // Persist healthy data to client localStorage
      const finalSubjects = isSubjectsOk ? subjects : catalog.subjects;
      const finalBooks = isBooksOk ? books : catalog.books;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          subjects: finalSubjects,
          books: finalBooks,
          lastFetched: Date.now()
        }));
      } catch (e) {
        console.warn('[Redux Catalog] Could not save to localStorage:', e);
      }

      return {
        subjects: finalSubjects,
        books: finalBooks,
        dbConnected: true,
        fromCache: false
      };
    } catch (err) {
      console.error('[Redux Catalog] Network error fetching catalog:', err);
      return rejectWithValue({
        message: err.message || 'Network error connecting to API',
        dbConnected: false
      });
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    subjects: initialCache.subjects,
    books: initialCache.books,
    status: initialCache.subjects.length > 0 ? 'succeeded' : 'idle',
    lastFetched: initialCache.lastFetched,
    dbConnected: true,
    error: null
  },
  reducers: {
    catalogUpdated: (state, action) => {
      if (action.payload?.subjects) state.subjects = action.payload.subjects;
      if (action.payload?.books) state.books = action.payload.books;
      state.lastFetched = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          subjects: state.subjects,
          books: state.books,
          lastFetched: state.lastFetched
        }));
      } catch (_) {}
    },
    setDbStatus: (state, action) => {
      state.dbConnected = Boolean(action.payload);
    },
    clearCatalogCache: (state) => {
      state.subjects = [];
      state.books = [];
      state.lastFetched = null;
      state.status = 'idle';
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogData.pending, (state) => {
        if (state.subjects.length === 0) {
          state.status = 'loading';
        }
      })
      .addCase(fetchCatalogData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.subjects = action.payload.subjects;
        state.books = action.payload.books;
        state.dbConnected = action.payload.dbConnected;
        state.error = null;
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchCatalogData.rejected, (state, action) => {
        state.status = state.subjects.length > 0 ? 'succeeded' : 'failed';
        state.dbConnected = action.payload?.dbConnected ?? false;
        state.error = action.payload?.message || 'Database connection error';
        // Crucial: preserve existing subjects and books so UI never goes blank on temporary connection loss!
      });
  }
});

export const { catalogUpdated, setDbStatus, clearCatalogCache } = catalogSlice.actions;

// Selectors
export const selectAllSubjects = (state) => state.catalog.subjects;
export const selectAllBooks = (state) => state.catalog.books;
export const selectCatalogStatus = (state) => state.catalog.status;
export const selectCatalogLoading = (state) => state.catalog.status === 'loading';
export const selectDbConnected = (state) => state.catalog.dbConnected;
export const selectCatalogError = (state) => state.catalog.error;

export const selectBooksBySubject = (subjectId) => (state) => {
  if (!subjectId) return state.catalog.books;
  return state.catalog.books.filter((b) => {
    const bSubId = typeof b.subjectId === 'object' ? b.subjectId?._id : b.subjectId;
    return String(bSubId) === String(subjectId);
  });
};

export default catalogSlice.reducer;

