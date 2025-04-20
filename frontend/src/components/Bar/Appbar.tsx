import { useNavigate } from "react-router-dom";
import BarcodeScannerIcon from "../SVG/BarcodeScannerIcon";
import Homeicon from "../SVG/Homeicon";
import ProfileIcon from "../SVG/ProfileIcon";

export default function Appbar() {
  const navigate = useNavigate()
  return (
    <div className="border-t-1 border-white text-white bg-black grid grid-cols-3">
      <div onClick={()=>{navigate('/')}} className="p-4 pl-8 flex items-center justify-start">
        <Homeicon />
      </div>
      <div className="p-4 flex justify-center items-center -mt-12">
        <div onClick={()=>{navigate('/foodScan/barcodescanner')}} className="bg-teal-300 rounded-full p-4 flex w-26 flex-col items-center justify-center">
          <BarcodeScannerIcon />
          <p className="text-black font-bold">Scan</p>
        </div>
      </div>
      <div onClick={()=>{navigate('/profile')}} className="p-4 pr-8 flex items-center justify-end">
        <ProfileIcon />
      </div>
    </div>
  );
}
