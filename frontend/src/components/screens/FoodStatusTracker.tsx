import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../utils/Loader";

interface SSEData {
  status: string;
  safeOrNot?: boolean;
  reason?: string;
  foodItemDetails?: {
    name: string;
    itemImage: string;
    ingredientsImage: string;
    nutrientsImage: string;
    ingredients: string;
  };
  error?: boolean;
}

const FoodStatusTracker = () => {
  const { foodId } = useParams();
  const userEmail = localStorage.getItem("email");
  const userAllergies = localStorage.getItem("allergies");
  const [data, setData] = useState<SSEData | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let eventSource: EventSource | null = null;
    const fetch = async () => {
      try {
        setLoading(true);
        eventSource = new EventSource(
          `${
            import.meta.env.VITE_SERVER_URL
          }/foodItem/api/job-events/${foodId}/${userEmail}`
        );
        eventSource.onmessage = (event) => {
          const safeData = JSON.parse(event.data) as unknown as SSEData;
          if (safeData.status === "error") {
            setErrorMessage(true);
          }
          setData(safeData);
          if (
            safeData.status &&
            (safeData.status === "close" || safeData.status === "error")
          ) {
            setLoading(false);
          }
        };
        await axios.post(
          `${
            import.meta.env.VITE_SERVER_URL
          }/foodItem/packcheck/${foodId}/${userEmail}`,
          { userAllergies },
          { withCredentials: true }
        );
        if (
          data?.status &&
          (data.status === "close" || data.status === "error")
        ) {
          setLoading(false);
          () => eventSource!.close();
        }
      } catch (error: any) {
        console.error("Error fetchingdata:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };
    fetch();
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [foodId, userEmail, navigate]);

  if (errorMessage)
    return (
      <div className="p-4 pt-6">
        <span className="text-red-300 font-pixelfont text-4xl">
          Error <br /> generating <br /> Report
        </span>
        <p className="text-2xl text-white ">Rescan the food packet</p>
      </div>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-black w-screen text-white p-4">
      {data && data.foodItemDetails ? (
        <p className="text-2xl py-2 text-teal-200 font-pixelfont">
          {data?.foodItemDetails?.name}
        </p>
      ) : null}
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center gap-4">
          <div
            onClick={() => {
              setImgIndex((prev) => Math.max(prev - 1, 0));
            }}
            className="bg-gray-400 p-4 w-4 h-4 flex items-center justify-center rounded-full cursor-pointer"
          >
            <p className="-mt-1 font-extrabold">{`<`}</p>
          </div>
          {data && data.foodItemDetails ? (
            <img
              className="h-100 w-76"
              src={
                imgIndex === 0
                  ? data.foodItemDetails.itemImage
                  : imgIndex === 1
                  ? data.foodItemDetails.ingredientsImage
                  : data.foodItemDetails.nutrientsImage
              }
            />
          ) : null}
          <div
            onClick={() => {
              setImgIndex((prev) => (prev + 1) % 3);
            }}
            className="bg-gray-400 p-4 w-4 h-4 flex items-center justify-center rounded-full cursoir-pointer"
          >
            <p className="-mt-1 font-extrabold">{`>`}</p>
          </div>
        </div>
        <div className="bg-teal-500 flex flex-row rounded-full">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className={`w-2 h-2 ${
                imgIndex === item ? "bg-white" : "bg-black"
              } rounded-full m-1`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="flex gap-1">
          It is{" "}
          <span className="text-teal-200">
            {data && data.safeOrNot ? "Safe" : "Not Safe"}
          </span>{" "}
          for you to consume
        </p>
        {data?.reason ? <p>Reason - {data.reason}</p> : null}
        <div className="border-1 p-2 rounded-lg border-teal-200">
          {data?.foodItemDetails ? (
            <p>Ingredients- {data.foodItemDetails.ingredients}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FoodStatusTracker;
