import { stringify } from "querystringify";
type RequestInitWithQuery<APIResponseBodyType> = RequestInit & { params?: object, handler?: (value: Response) => Promise<APIResponseBodyType> };

export const createFetchClient = (token?: string | null) => {
  const fetchFn = function <APIResponseBodyType>(url: string, { params, headers, handler, ...opt }: RequestInitWithQuery<APIResponseBodyType> | undefined = {}): Promise<APIResponseBodyType> {
    const urlWithQuery = params ? url + stringify(params, true) : url;

    const fetchOpt = {
      headers: {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...opt
    } satisfies RequestInit;

    return fetch(urlWithQuery, fetchOpt).then(handler || handleResponse<APIResponseBodyType>);
  };

  // helper functions
  fetchFn.get = <U>(url: string, opt?: RequestInitWithQuery<U>) => fetchFn<U>(url, { method: 'GET', ...opt });
  fetchFn.post = <APIResponseBodyType, BodyType,>(url: string, body: BodyType, opt?: RequestInitWithQuery<APIResponseBodyType>) => fetchFn<APIResponseBodyType>(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opt,
  });
  fetchFn.put = <APIResponseBodyType, BodyType,>(url: string, body: BodyType, opt?: RequestInitWithQuery<APIResponseBodyType>) => fetchFn<APIResponseBodyType>(url, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opt,
  })
  fetchFn.delete = <APIResponseBodyType>(url: string, opt?: RequestInitWithQuery<APIResponseBodyType>) => fetchFn<APIResponseBodyType>(url, { method: 'DELETE', ...opt });
  fetchFn.head = (url: string, opt?: RequestInitWithQuery<null>) => fetchFn<null>(url, { method: 'HEAD', ...opt });
  fetchFn.patch = <APIResponseBodyType, BodyType>(url: string, body: BodyType, opt?: RequestInitWithQuery<APIResponseBodyType>) => fetchFn<APIResponseBodyType>(url, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opt,
  })

  fetchFn.loggedIn = !!token;

  return fetchFn;
}

function handleResponse<T>(response: Response): Promise<T> {
  return response.json().then(obj => {
    const data = obj as T;

    if (!response.ok) {
      console.error("API Error", response);
      const error = { data: data, statusText: response.statusText, statusCode: response.status };
      return Promise.reject(error);
    }

    return data;
  });
}