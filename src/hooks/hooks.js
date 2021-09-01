import React, { useEffect } from 'react'
import { fireFetch, client } from '../client/client'
import config from '../config'

const actionTypes = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
}

const defaultInitialState = { status: actionTypes.IDLE, data: null, error: null }
const pendingState = {status: actionTypes.IDLE, data: null, error: null}

function queryReducer(state, action) {
  switch (action.type) {
    case actionTypes.PENDING:
      return pendingState
    case actionTypes.RESOLVED:
      return {
        status: actionTypes.RESOLVED, 
        data: action.data, 
        error: null
      }
    case actionTypes.REJECTED:
      return {
        status: actionTypes.REJECTED, 
        data: action.data, 
        error: action.error
      }
    default: {
      throw new Error(`Unhandled action type ${action.type}`)
    }
  }
}

export function useAsync(initialState = {}) {
  const [{ 
    status, 
    data, 
    error 
  }, dispatch] = React.useReducer(
    queryReducer, { ...defaultInitialState, ...initialState }
  )
  
  const run = React.useCallback(promise => {
    dispatch({ type: "pending" });
    promise.then(
      data => dispatch({ type: actionTypes.RESOLVED, data }),
      error => dispatch({ type: actionTypes.REJECTED, error })
    )
  }, [])

  return {
    isIdle: status === actionTypes.IDLE,
    isLoading: status === actionTypes.PENDING,
    isError: status === actionTypes.REJECTED,
    isSuccess: status === actionTypes.RESOLVED,
    error,
    status,
    data,
    run,
  }
}

function useGetToken() {
  const tokenUrl = config.api.authUrl
  const { data, isSuccess, run } = useAsync();

  useEffect(() => {  
    const result = fireFetch(tokenUrl)
    run(result)
    
  }, [run, tokenUrl]);

  if (isSuccess) {
    return data?.access_token
  }
}

function useGetList(url, token) {
  const { data, isSuccess, isError, isLoading, run } = useAsync();

  useEffect(() => {
    if (token) {
      const result = client(
        url, 
        { headers: { Authorization: `Bearer ${token}` }, body: null }
      )  
      run(result)
    }
    
  }, [url, token, run]);

  if (isError) {} // catch error handling here }
  if (isLoading) {} // Add Loading state here }

  if (isSuccess) {
    return data
  }
}


/*
  This function is the primary hook for retrieving the 3 playlists.
  
  When using the 'client_credentials' auth approach, Spotify requires
  an initial post request to retrieve an auth token, which then you 
  need to supply for each api request, there after.

  There are a few different ways this implementation could have been 
  accomplished, this is just one of them.

  I decided to go with the approach of calling them all one after the 
  other, without waiting upon each one to be completed (in paralell)
  because we want to be able to display each one in it's own list, 
  but it doesn't necessarily need to load from top to bottom, in order. 
  If one request takes longer, that's ok. Another important advantage 
  of this appraoch is that they are all non-blocking. So at any
  time a request fails, the others are able to succeed and you can
  individually create fallback approaches for each one that fails,
  rather than the paralell approach and catching any errors that happen
  for all.

  Initiially, i was going to go with the Promise.all() approach, but
  because of the main reasons outlined above, I felt this may provide
  a better UX overall
*/
export function useGetData() {
  const token = useGetToken()

  const releases = useGetList(config.URLS.RELEASES, token)
  const featured = useGetList(config.URLS.FEATURED, token)
  const categories = useGetList(config.URLS.CATEGORIES, token)
  
  return {
    releases: releases?.albums?.items,
    featured: featured?.playlists?.items,
    categories: categories?.categories?.items
  }
}