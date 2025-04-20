import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserDetails } from "../components/utils/Callback";

const useRefreshToken = () => {
  const navigate = useNavigate()
  const refresh = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/refresh`,{withCredentials:true});
      if (res.status !== 401) {
        const userDetailsRes = res.data as unknown as UserDetails;
        return userDetailsRes.accessToken;
      } else {
        console.error("Invalid response format");
        localStorage.clear()
        navigate('/auth/login')
        return null;
      }
    } catch (error) {
      navigate('/auth/login')
    }
  };

  return refresh;
}

export default useRefreshToken;