import axios, {
  AxiosHeaderValue,
  AxiosInstance,
  AxiosRequestHeaders,
} from "axios";

export function makeAxios(
  token?: string,
  baseURL = process.env.API_SERVER_ORIGIN
) {
  const instance: AxiosInstance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use((config) => {
    if (token) {
      const headers = config.headers as AxiosRequestHeaders;
      headers["Authorization"] = `Bearer ${token}` as AxiosHeaderValue;
      config.headers = headers;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      return Promise.reject(err);
    }
  );

  return instance;
}
