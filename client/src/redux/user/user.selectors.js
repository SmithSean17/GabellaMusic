import { createSelector } from 'reselect';

const selectUser = (state) => state.user;

export const selectCurrentUser = createSelector(
  [selectUser],
  (user) => user.currentUser
);

export const selectUserSignInOrOutError = createSelector(
  [selectUser],
  (user) => user.signInOrOutError
);

export const selectUserSignUpError = createSelector(
  [selectUser],
  (user) => user.signUpError
);

export const selectForgotOrResetError = createSelector(
  [selectUser],
  (user) => user.forgotOrResetError
);

export const selectForgotOrResetConfirm = createSelector(
  [selectUser],
  (user) => user.forgotOrResetConfirm
);
