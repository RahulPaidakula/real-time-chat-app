import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

let connection = null;
let messageCallback = null;
let userOnlineCallback = null;
let userOfflineCallback = null;

export function startSignalR() {
  connection = new HubConnectionBuilder()
    .withUrl(`${process.env.REACT_APP_API_URL}/hub/chat`, {
      withCredentials: true
    })
    .configureLogging(LogLevel.Information)
    .build();

  connection.on("ReceiveMessage", (message) => {
    if (messageCallback) {
      messageCallback(message);
    }
  });

  connection.on("UserOnline", (userId, displayName) => {
    if (userOnlineCallback) {
      userOnlineCallback(userId, displayName);
    }
  });

  connection.on("UserOffline", (userId) => {
    if (userOfflineCallback) {
      userOfflineCallback(userId);
    }
  });

  return connection.start()
    .then(() => {
      console.log("SignalR connected.");
      return connection;
    })
    .catch(err => {
      console.error("SignalR Connection Error: ", err);
      throw err;
    });
}

export function getConnection() {
  return connection;
}

export function joinGroup(groupId) {
  if (!connection) {
    console.error("Cannot join group: SignalR not connected");
    return Promise.reject("SignalR not connected");
  }
  
  if (connection.state !== "Connected") {
    console.log("Connection not ready yet, waiting to join group...");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (connection.state === "Connected") {
          connection.invoke("JoinGroup", groupId)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error("Connection failed to reach Connected state"));
        }
      }, 1000); 
    });
  }
  
  return connection.invoke("JoinGroup", groupId);
}

export function leaveGroup(groupId) {
  if (!connection) {
    console.error("Cannot leave group: SignalR not connected");
    return Promise.reject("SignalR not connected");
  }
  return connection.invoke("LeaveGroup", groupId);
}

export function sendMessage(groupId, messageText) {
  if (!connection) {
    console.error("Cannot send message: SignalR not connected");
    return Promise.reject("SignalR not connected");
  }
  return connection.invoke("SendMessage", groupId, messageText);
}

export function setMessageCallback(callback) {
  messageCallback = callback;
}

export function setUserOnlineCallback(callback) {
  userOnlineCallback = callback;
}

export function setUserOfflineCallback(callback) {
  userOfflineCallback = callback;
} 