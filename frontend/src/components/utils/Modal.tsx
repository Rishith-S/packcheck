import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Modal({
  open,
  setOpen,
  userAllergies,
  setUserAllergies,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userAllergies: string[];
  setUserAllergies: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [modalUserAllergies, setModalUserAllergies] = useState<string[]>(userAllergies);
  const [inputText, setInputText] = useState<string>('');
  const navigate = useNavigate();

  const notify = (message: string) =>
    toast(message, {
      style: {
        backgroundColor: "black",
        color: "white",
        width: "50vw", // Occupy half the screen width
      },
      progressClassName: "bg-teal-500", // Set progress bar color to teal
      autoClose: 3000, // Timer set to 3 seconds
    });
  const handleSave = async () => {
    setUserAllergies(modalUserAllergies);
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/allergies/add-or-update-allergies`, 
        { allergies: modalUserAllergies }, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      if(res.status === 200){
        localStorage.setItem('allergies',JSON.stringify(modalUserAllergies));
        notify("Allergies updated");
      }
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally{
      setTimeout(()=>{
        setOpen(false);
      },1000)
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <ToastContainer />
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-800/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-screen md:w-1/3  data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="w-full h-100 p-4">
              <div className="flex flex-col gap-2">
                <label
                  id="first_name"
                  className="mb-2 text-lg font-bold text-black"
                >
                  Type your Allergies
                </label>
                <input
                  type="text"
                  id="first_name"
                  className="placeholder:text-gray-400 text-lg rounded-lg block w-full p-2.5 ring-2 ring-black focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Type Here..."
                  required
                  value={inputText}
                  onChange={(e)=>setInputText(e.target.value)}
                />
                <div
                  onClick={() => {
                    if (inputText) {
                      setInputText('');
                      setModalUserAllergies((prev) => [...prev, inputText]);
                    }
                  }}
                >
                  <p className="text-black font-bold p-2 cursor-pointer">+ Add Item</p>
                </div>
                <div id="modal" className="flex flex-col gap-2 h-42 pr-2 overflow-auto">
                  {modalUserAllergies.map((allergy, index) => (
                    <div
                      key={`${allergy}-${index}`}
                      className="bg-white p-2 rounded-lg flex flex-row justify-between border-1 border-teal-600"
                    >
                      <p className="font-bold">{allergy}</p>
                      <p
                        onClick={() => {
                          setModalUserAllergies((prev) =>
                            prev.filter((_,filterIndex) => filterIndex !== index)
                          );
                        }}
                        className="text-teal-700 font-extrabold cursor-pointer"
                      >
                        X
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-end gap-2 mt-2">
                  <div
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="bg-teal-200 rounded-md w-1/2 flex items-center justify-center cursor-pointer"
                  >
                    <p className="text-black font-bold p-2">Cancel</p>
                  </div>
                  <div onClick={handleSave} className="bg-black rounded-md w-1/2 flex items-center justify-center cursor-pointer">
                    <p className="text-white font-bold p-2">Save</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
