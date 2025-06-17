import axios from "axios";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export interface UserDetails {
  name: string;
  email: string;
  accessToken: string;
  message:string;
  picture?:string;
  allergies:string[]
}
export default function Callback() {
  const location = useLocation();
  const called = useRef(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken")!;
  const type = location.pathname.split("/").slice(-1)[0];
  useEffect(() => {
    (async () => {
      if (!accessToken || accessToken.length === 0) {
        try {
          if (called.current) return; 
          called.current = true;
          const res = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/auth/token${
              window.location.search
            }&type=${type}`,
            { withCredentials: true }
          );
          const userDetails: UserDetails = res.data as unknown as UserDetails;
          localStorage.setItem("name", userDetails.name);
          localStorage.setItem("email", userDetails.email);
          localStorage.setItem("picture", userDetails.picture!);
          if(userDetails.picture)localStorage.setItem("picture", userDetails.picture);
          localStorage.setItem("accessToken", userDetails.accessToken);
          localStorage.setItem("allergies", JSON.stringify(userDetails.allergies));
          navigate("/");
        } catch (err) {
          console.error(err);
          navigate(`/auth/${type}`);
        }
      } else if (accessToken) {
        navigate("/");
      }
    })();
  }, [navigate]);
  return (
    <></>
  );
}
