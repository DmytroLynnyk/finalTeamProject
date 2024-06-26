import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { authReducer, verifyEmailSuccess } from './auth/slice';
import { waterReducer } from './water/waterSlice';
import { createBrowserHistory } from 'history';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['accessToken', 'refreshToken'],
};

const history = createBrowserHistory();

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    water: waterReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV === 'development',
});

const persistor = persistStore(store, null, () => {
  const urlParams = window.location.search;
  const accessToken = urlParams.substring(1);
  if (accessToken) {
    store.dispatch(verifyEmailSuccess(accessToken));
    history.push('/finalTeamProject/tracker');
  }
});
export { persistor };
