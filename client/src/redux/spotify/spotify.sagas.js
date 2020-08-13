import { takeLatest, put, all, call } from 'redux-saga/effects';

import SpotifyActionTypes from './spotify.types';

import {
  markConnected,
  connectFailure,
  refreshAuthTokenSuccess,
  refreshAuthTokenFailure,
  fetchTopArtistsSuccess,
  fetchTopArtistsFailure,
} from './spotify.actions';

import axios from 'axios';
// axios.defaults.withCredentials = true;

export function* isConnected() {
  try {
    const userConnectedRes = yield axios.get(
      'http://localhost:8000/api/v1/users/isConnectedToSpotify'
    );

    if (!userConnectedRes.status) return;
    yield put(markConnected());
  } catch (err) {
    yield put(connectFailure(err.response.data.status));
  }
}

export function* refreshAuthTokenAsync() {
  try {
    yield axios.post('http://localhost:8000/api/v1/spotify/refreshToken', {
      withCredentials: true,
    });

    yield put(refreshAuthTokenSuccess());
  } catch (err) {
    yield put(refreshAuthTokenFailure(err));
  }
}

export function* refreshAuthTokenStart() {
  yield takeLatest(
    SpotifyActionTypes.REFRESH_AUTH_TOKEN_START,
    refreshAuthTokenAsync
  );
}

export function* onCheckConnection() {
  yield takeLatest(SpotifyActionTypes.CHECK_CONNECTION, isConnected);
}

export function* fetchEndpointDataAsync(endpoint, stateProps) {
  try {
    const response = yield axios.post(
      'http://localhost:8000/api/v1/spotify/getEndpointData',

      {
        endpoint,
        withCredentials: true,
      }
    );

    const endpointData = response.data;

    if (stateProps === 'topArtists') {
      yield put(fetchTopArtistsSuccess(endpointData));
    }
  } catch (err) {
    if (stateProps === 'topArtists') {
      yield put(fetchTopArtistsFailure(err.message));
    }
  }
}

export function* fetchTopArtistsStart(endpoint, stateProps = 'topArtists') {
  yield takeLatest(
    SpotifyActionTypes.FETCH_TOP_ARTISTS_START,
    fetchEndpointDataAsync,
    (endpoint = 'me/top/artists?time_range=long_term'),
    stateProps
  );
}

export function* spotifySagas() {
  yield all([
    call(onCheckConnection),
    call(refreshAuthTokenStart),
    call(fetchTopArtistsStart),
  ]);
}
