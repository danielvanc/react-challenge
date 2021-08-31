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
  if (isLoading) {} // Add Loading spinner here }

  if (isSuccess) {
    return data
  }
}

export function useGetData(url) {
  const token = useGetToken()

  const releases = useGetList("https://api.spotify.com/v1/browse/new-releases", token)
  const featured = useGetList("https://api.spotify.com/v1/browse/featured-playlists", token)
  const categories = useGetList("https://api.spotify.com/v1/browse/categories", token)
  
  return {
    releases,
    featured,
    categories
  }
}