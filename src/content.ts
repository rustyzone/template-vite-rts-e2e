import { MessageType } from "./lib/types";
import Browser from "webextension-polyfill";
import clog from "./lib/clog";

clog("content script");

// listen for window message from web app to login user
// can use this method or externally_connectable (shown in future video)
window.addEventListener("message", async (event) => {
    // We only accept messages from ourselves
    if (event.source != window) return;

    clog("Content script received web message: ", event.data);
    
    if (event.data.type && (event.data.type == MessageType.AppAuth)) {
        clog("Content script - AppAuth: ", event.data);
        // send message to background
        chrome.runtime.sendMessage({
            type: MessageType.AppAuth,
            payload: event.data.payload
        })

    
    }
}, false);

// send message to web app to check if user is logged in
const checkAuth = async () => {
    const resp = await Browser.runtime.sendMessage({
        type: MessageType.CheckAuth,
    });
    clog("check auth", resp);
}

checkAuth();
