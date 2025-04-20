import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useRefreshToken from "../../hooks/useRefreshToken";
import Loader from "./Loader";

export default function PersistentLogin() {
  const [loading, setLoading] = useState(true);
  const refresh = useRefreshToken();
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate()
  useEffect(() => {
    const verifyRefreshToken = async () => {
      setLoading(true)
      try {
        await refresh();
      } catch (err) {
        console.log(err);
        navigate('/auth/login')
      } finally {
        setLoading(false);
      }
    };
    !accessToken || accessToken.length===0 ? verifyRefreshToken() : setLoading(false);
  }, [accessToken, refresh]);
  return (
    <>
      {loading ? <Loader /> : <Outlet/>}
    </>
  );
}
