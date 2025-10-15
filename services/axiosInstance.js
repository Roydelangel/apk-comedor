import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';


let isRefreshing = false;
let subscribers = [];

const onAccessTokenFetched = (newAccessToken) => {
  subscribers.forEach((callback) => callback(newAccessToken));
  subscribers = [];
};


const axiosInstance = axios.create({
  baseURL: `http://10.231.182.225:8000/api`,
});


axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = JSON.parse(await AsyncStorage.getItem("accessToken"))
    if (accessToken) {
      config.headers["Authorization"] = "Bearer " + accessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribers.push((newAccessToken) => {
            originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `http://192.168.1.100:8000/api/login/refresh`,
          {
            refresh: `${JSON.parse(await AsyncStorage.getItem("refreshToken"))}`,
          }
        );

        const newAccessToken = data.access;
        AsyncStorage.setItem("accessToken", JSON.stringify(newAccessToken));

        axiosInstance.defaults.headers["Authorization"] = `Bearer ${newAccessToken}`;
        onAccessTokenFetched(newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
