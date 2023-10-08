import supabase from "./lib/initSupabase"
import User from "./lib/User";
import clog from "./lib/clog";
import { MessageType } from "./lib/types";
import Browser from "webextension-polyfill";
import { track, Event } from "./lib/analytics";

try {

  const user = User.getInstance();
  clog("user", user);

  // log supabase instance
  clog("supabase", supabase);

  // on init track event
  track(Event.SerrvierWorkerInit);

  track(Event.SerrvierWorkerInit,{source:'name'});


  const callApi = async () => {
 

    try{
    const apiPath = 'http://localhost:3001/api/db'

  
    const resp = await fetch(apiPath, {
      method: 'POST',
    })
    
    const data = await resp.json();
    } catch (e) {
      console.log('API ERROR', e);
    }
  
  }


  // Open onboarding tab on install
  chrome.runtime.onInstalled.addListener(async (details) => {
    // check if reason is install
    clog("reason", details);
    switch (details.reason) {
      case "install":
        const onboardingUrl = chrome.runtime.getURL(
          "src/pages/onboarding/index.html"
        );
        chrome.tabs.create({ url: onboardingUrl });
        break;
      case "update":

        console.log('extension updated call api - db call')
        callApi();
        break;
    }
  });

  const onMessageListener = async (
    message: any,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<any> => {
 
    switch (message.type) {

      case MessageType.CheckAuth:
        // check if user is logged in
        clog("SW check auth", message);
        sendResponse({ isLoggedIn: user.isLoggedIn, user:user.user });
        break;

      
      case MessageType.Login: {
        // 
        clog("login user", message);
        // pass username and password to supabase
        const email = message.payload.email;
        const password = message.payload.password;
         const resp = await User.getInstance().login(email, password);

          clog("SW login resp", resp);
          clog("SW debug user", {user: User.getInstance().user, isLoggedIn: User.getInstance().isLoggedIn});

          // Message active tab with login status
          const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
          if(!tabs[0]) return;
          const tabId = tabs[0].id;
          if(!tabId) return;
          
          // send message to content script
          Browser.tabs.sendMessage(tabId, {
            type: MessageType.LoginSuccess,
            payload: {
              isLoggedIn: User.getInstance().isLoggedIn,
              user: User.getInstance().user
            }
          });

        break;
      } 
      case MessageType.AppAuth: {
        // send message to background
        clog("app auth", message);

        // Useful for passing auth from web app to extension
        await User.getInstance().loginWithToken(message?.payload?.a, message?.payload?.r);

          // Message active tab with login status
          const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
          if(!tabs[0]) return;
          const tabId = tabs[0].id;
          if(!tabId) return;
          
          // send message to content script
          Browser.tabs.sendMessage(tabId, {
            type: MessageType.LoginSuccess,
            payload: {
              isLoggedIn: User.getInstance().isLoggedIn,
              user: User.getInstance().user
            }
          });
        break;
      }
    }
    return true;
  };


  // Add listener for messages from content script
  if (!chrome.runtime.onMessage.hasListeners()) {
    const messageCallback = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => onMessageListener(message, sender, sendResponse);

    chrome.runtime.onMessage.addListener(messageCallback);
  }
} catch (e) {
  clog("error", e);
}
