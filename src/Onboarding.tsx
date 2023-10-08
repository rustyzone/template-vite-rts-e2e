import React, { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import './css/styling.css';
import clog from "./lib/clog";
import { MessageType } from "./lib/types";


const App = (): JSX.Element => {
  const [granted, setGranted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {

    // listen for messages from background script
    Browser.runtime.onMessage.addListener((msg) => {
      clog("Onboarding debug msg:", {msg});

      switch (msg.type) {
        case MessageType.LoginSuccess:
          // redirect to web app
          const { user, isLoggedIn } = msg.payload;
          setLoggedIn(isLoggedIn && user);
          break;
        case MessageType.LoginFailure:
          // show error message
          setAuthError(true);
          break;
        default:
          break;
      }
    });

    // check if user is logged in
    (async () => {
      const resp = await Browser.runtime.sendMessage({ type: MessageType.CheckAuth });
      if (resp?.isLoggedIn && resp?.user) {
        setLoggedIn(true);
      }
    })();
  }, []);


  useEffect(() => {
    (async () => {
      // check if host permissions are enabled
      const resp = await Browser.permissions.contains({
        origins: ["http://localhost:3000/*"],
      });
      setGranted(resp);
    })();
  }, []);

  // log in user, then message background script to check auth status
  const loginUser = async (email: string, password: string) => {
    Browser.runtime.sendMessage({ 
      type: MessageType.Login, 
      payload: {
        email,
        password
      } 
    });
  }

  return (
    <div className="flex flex-1 min-h-screen items-start justify-center bg-[#12141d]">
      <div className=" max-w-2xl my-6 rounded-md shadow-lg w-full px-4 py-6 justify-center items-center bg-white bg-opacity-5 text-[#f1f1f1]">
        <h1 className="text-2xl text-gray-400 font-black">Welcome! 👋</h1>

        {showLogin ? (

          <div className="bg-white bg-opacity-5 rounded-md p-4">

            {loggedIn ? (
              <p className="text-green-500 text-lg">You are now logged in. Please close this tab.</p>
            ) : (
              <p className="text-gray-400 text-lg">Please login to continue.</p>
            )}

            {authError && (
              <p className="text-red-500 text-lg">Sorry, your login details are incorrect. Please try again.</p>
            )}
            {/* Login Form */}
            <div className="flex flex-col">
              <label className="text-gray-400 text-lg">Email</label>
              <input className="border border-gray-400 rounded-md p-2 bg-gray-600" type="text"
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                }}
               />

              <label className="text-gray-400 text-lg">Password</label>
              <input className="border border-gray-400 rounded-md p-2 bg-gray-600" type="password"
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                }}
               />

              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => {
                  // log in user, then message background script to check auth status
                  loginUser(formData.email, formData.password);
                  
                }}
              >
                Login
              </button>

            </div>
          </div>
        ) : (
          <>
        {!granted && (
          <>
            <p className="py-4 text-gray-300 text-lg">
             Please click below to enable host permission to begin, without
              this the extension cannot run.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={async () => {
                const resp = await Browser.permissions.request({
                  origins: ["http://localhost:3000/*"],
                });

                setGranted(resp);
              }}
            >
              Enable Host Permissions
            </button>
          </>
        )}

        {granted && (
          <div>
            <p className="py-4 text-gray-400 text-lg">
              Almost ready, click below to continue & login.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                // change url of the current tab to the app url

                // Change current tab or show message - if web app auth direct to web app here
                // chrome.tabs.update({ url: `${appUrl}/extension-install` });

                // otherwise show login form
                setShowLogin(true);

              }}
            >
              Continue
            </button>

          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default App;
