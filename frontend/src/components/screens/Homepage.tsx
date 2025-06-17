import axios from "axios";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../utils/Modal";
import Loader from "../utils/Loader";
import { useNavigate } from "react-router-dom";

export interface UserActivityInterface {
  id: number;
  foodName: string;
  foodId: string;
  userEmail: string;
  status: boolean;
  reason: string;
  createdAt: Date;
}

export default function Homepage() {
  const name = localStorage.getItem("name");
  const allergiesString = localStorage.getItem("allergies");
  const allergies: string[] = JSON.parse(allergiesString!);
  const [userAllergies, setUserAllergies] = useState<string[]>(allergies);
  const [userActivity, setUserActivity] = useState<UserActivityInterface[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/foodItem/get-user-activity/homepage/0`,
          { withCredentials: true }
        );
        setUserActivity(
          res.data.userFoodScans as unknown as UserActivityInterface[]
        );
      } catch (error: any) {
        console.log(error);
        if (error.response?.status === 401) {
          // Clear local storage and redirect to login
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate]);

  if (loading) return <Loader />;

  return (
    <div className="p-4 flex flex-col gap-4">
      <Modal
        open={open}
        setOpen={setOpen}
        userAllergies={userAllergies}
        setUserAllergies={setUserAllergies}
      />
      <p className="text-white text-3xl font-pixelfont font-bold">Welcome {name}</p>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
        <div className="border-2 rounded-lg border-teal-400/50 md:max-h-100">
          <div className="flex flex-row items-center justify-between border-b-2 border-teal-400/50 p-2">
            <div className="text-white font-bold">Your Allergies</div>
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="bg-teal-200 font-bold rounded-md p-2"
            >
              Add/Edit Allergies
            </div>
          </div>
          <div className="p-2 h-42 overflow-y-auto">
            <div className="overflow-x-auto max-h-38 flex flex-wrap w-full scroller">
              {userAllergies.map((allergy, index) => (
                <p
                  className="text-white whitespace-nowrap text-lg"
                  key={`${allergy}-${index}`}
                >
                  {allergy}
                  {index !== userAllergies.length - 1 ? ", " : ""}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-gray-900/75 md:border-2 md:border-gray-800 rounded-md flex flex-col justify-start">
            <p className="text-white p-4 font-bold border-b-1 border-gray-700">
              Recent Activity
            </p>
            {userActivity &&
              (userActivity.length === 0 ? (
                <p className="text-2xl text-teal-200 items-center justify-center flex p-2 font-pixelfont tracking-wi">
                  No activity
                </p>
              ) : (
                userActivity.map((item) => (
                  <FoodItem
                    name={item.foodName}
                    status={item.status}
                    key={item.foodId}
                  />
                ))
              ))}
            {userActivity.length !== 0 && (
              <p
                onClick={() => {
                  navigate("/userActivity");
                }}
                className="text-teal-400 cursor-pointer p-4 font-bold text-center border-gray-700"
              >
                View All Activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const FoodItem = ({
  name,
  status,
}: {
  name: string;
  status: boolean;
}) => {
  return (
    <div className="p-2 border-b-1 border-gray-700">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <div className="bg-gray-800/50 p-2 rounded-full flex items-center justify-center">
            {status ? (
              <CheckCircle color="green" />
            ) : (
              <AlertCircle color="red" />
            )}
          </div>
          <div className="text-white">
            {name.length > 22 ? name.slice(0, 22).concat("...") : name}
          </div>
        </div>
        <div
          className={`${
            status
              ? "text-green-600 bg-green-950/50"
              : "text-red-400 bg-red-950/50"
          } p-2 rounded-md font-extrabold`}
        >
          {status ? "Safe" : "Not Safe"}
        </div>
      </div>
    </div>
  );
};
