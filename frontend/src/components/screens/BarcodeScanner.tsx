import { BrowserMultiFormatReader } from "@zxing/library";
import { useEffect, useState } from "react";
import Loader from "../utils/Loader";
import { useNavigate } from "react-router-dom";

function BarcodeScanner() {
  const navigate = useNavigate();
  const [result, setResult] = useState("");
  const [reader, setReader] = useState<BrowserMultiFormatReader | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (result.length !== 0) {
      navigate(`/foodScan/${result}`);
    }
  }, [result]);

  let stream: MediaStream | null;

  const startScanning = async () => {
    try {
      setLoading(true);
      const newReader = new BrowserMultiFormatReader();
      setReader(newReader);
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      newReader.decodeFromStream(stream, "video", (result) => {
        if (result) {
          setResult(result.getText());
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = () => {
    if (reader) {
      reader.reset();
      setReader(null);
    }
    stream?.getTracks().forEach((track) => track.stop());
  };

  return (
    <>
      <div className={`flex items-center justify-center ${loading ? "h-full" : "h-0"}`}>
        {loading && <Loader />}
      </div>
      <div className={`bg-black ${loading ? "h-0" : "h-full"} w-screen overflow-hidden text-white p-4 flex flex-col items-center justify-center gap-4`}>
        <div>
            <p className="text-2xl text-center font-pixelfont tracking-widest">
              Place the barcode under good lighting to scan
            </p>
        </div>
        <video
          id="video"
          width="300"
          height="200"
          style={{ border: loading ? "0px" : "1px solid gray" }}
          className="rounded-lg"
        ></video>
      </div>
    </>
  );
}

export default BarcodeScanner;
