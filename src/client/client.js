import config from '../config';

export async function client(url, { data = "", method = "GET", headers: customHeaders, ...customConfig } = {}) {
  const config = {
    method,
    body: data ? JSON.stringify(data) : "",
    url,
    headers: {
      ...customHeaders,
    },
    ...customConfig
  }
  
  return await fetch(url, config)
    .then(res => res.json())
    .then((data) => data)
}

export async function fireFetch(api = "") {
  const auth = window.btoa(`${config.api.clientId}:${config.api.clientSecret}`)

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    "body": "grant_type=client_credentials"
  }
  
  return await client(api, options)
}