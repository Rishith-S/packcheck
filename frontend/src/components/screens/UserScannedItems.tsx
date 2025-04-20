import axios from "axios";
import { useEffect, useState } from "react";
import { UserActivityInterface } from "./Homepage";
import { CheckCircle, AlertCircle } from "lucide-react";
import Loader from "../utils/Loader";
import Pagination from "../utils/Pagination";

export default function UserScannedItems() {
  const [pageNo, setPageNo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [userActivity, setUserActivity] = useState<UserActivityInterface[]>([]);
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/foodItem/get-user-activity/page/${pageNo}`,
          { withCredentials: true }
        );
        setUserActivity(
          res.data.userFoodScans as unknown as UserActivityInterface[]
        );
        setTotalPages(
          res.data.count
        )
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [pageNo]);

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-2 p-4">
      <div>
        <p className="text-2xl font-pixelfont text-cyan-50">All Activity</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {userActivity.map((item) => (
          <FoodItem
            name={item.foodName}
            status={item.status}
            key={item.foodId}
            reason={item.reason}
          />
        ))}
      </div>
      <div>
        <Pagination currentPage={pageNo + 1} totalPages={(totalPages / 5 < 1 ? 1 : totalPages / 5)} setPageNo={setPageNo}/>
      </div>
    </div>
  );
}

export const FoodItem = ({
  name,
  status,
  reason,
}: {
  name: string;
  status: boolean;
  reason: string;
}) => {
  return (
    <div className="border-1 rounded-lg border-gray-700">
      <div className="flex flex-row items-center justify-between border-b-1 rounded-t-lg border-gray-700 p-2 gap-2">
          <div className="bg-gray-800/50 w-8 p-2 rounded-full flex items-center justify-center">
            {status ? (
              <CheckCircle color="green" />
            ) : (
              <AlertCircle color="red" />
            )}
          </div>
          <div className="text-white w-62 md:w-3/4">
            {name}
          </div>
          <div
            className={`${
              status
                ? "text-green-600 bg-green-950/50"
                : "text-red-400 bg-red-950/50"
            } p-2 rounded-md font-extrabold w-24 flex items-center justify-center`}
          >
            {status ? "Safe" : "Not Safe"}
          </div>
      </div>
      <div>
        <p className="p-2 text-white">Reason: {reason}</p>
      </div>
    </div>
  );
};
