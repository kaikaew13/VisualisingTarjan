import { SnackbarType } from '../components/Snackbar';

export type TAction =
  | {
      type: 'ADD_SNACKBAR';
      payload: {
        current: SnackbarType;
      };
    }
  | {
      type: 'REMOVE_SNACKBAR';
      payload: {
        key: string;
      };
    };

type TStateType = {
  queue: SnackbarType[];
};

export default function reducer(
  state: TStateType,
  action: TAction
): TStateType {
  switch (action.type) {
    case 'ADD_SNACKBAR': {
      const { queue } = state;
      const { current } = action.payload;
      const isInQueue = queue.some((snack) => snack.key === current.key);
      if (isInQueue) return state;
      return {
        queue: [...queue, current],
      };
    }

    case 'REMOVE_SNACKBAR': {
      const { queue } = state;
      const { key: snackKey } = action.payload;

      return {
        queue: queue.filter((snackbar) => snackbar.key !== snackKey),
      };
    }

    default:
      throw new Error('Unknown action type');
  }
}
