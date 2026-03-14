// Axios instance for the /v1 Agent Gateway (base is root, not /api)
import axios from "axios";

const ROOT_URL = "https://ninebyfourapi.herokuapp.com";

const agentAxios = axios.create({ baseURL: ROOT_URL });

agentAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const agentKey = localStorage.getItem("agent_key");
  if (agentKey) config.headers["X-Agent-Key"] = agentKey;
  return config;
});

export default agentAxios;
