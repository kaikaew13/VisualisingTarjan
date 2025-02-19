import { useContext, useCallback } from 'react';
import { SnackbarType } from '../components/Snackbar';
import { SnackbarContext } from '../context/SnackbarContext';
import { delay } from '../utils';

export default function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar was called outside of SnackbarProvider');
  }
  const { dispatch } = context;
  return useCallback(
    (snack: SnackbarType) => {
      dispatch({ type: 'ADD_SNACKBAR', payload: { current: snack } });
      (async () => {
        await delay(3000);
        dispatch({ type: 'REMOVE_SNACKBAR', payload: { key: snack.key } });
      })();
    },
    [dispatch]
  );
}
