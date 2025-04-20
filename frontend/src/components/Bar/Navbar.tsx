import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="p-4 bg-black border-b-2 border-teal-400 flex flex-row items-center justify-between">
      <p
        onClick={() => {
          navigate("/");
        }}
        className="text-teal-400 font-pixelfont text-4xl font-extrabold cursor-pointer"
      >
        PACKCHECK
      </p>
      <div className="hidden md:flex flex-row gap-4 ">
        <p
          onClick={() => {
            navigate("/foodScan/barcodescanner");
          }}
          className="text-white cursor-pointer font-pixelfont text-2xl font-extrabold"
        >
          Scan
        </p>
        <p
          onClick={() => {
            navigate("/profile");
          }}
          className="text-white cursor-pointer font-pixelfont text-2xl font-extrabold"
        >
          Profile
        </p>
      </div>
    </div>
  );
}
