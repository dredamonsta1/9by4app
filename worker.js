//in worker.js
self.onmessage = function (e) {
  console.log("Message received from main script");
  var workerResult = "Result: " + e.data[0] * e.data[1];
  console.log("Posting message back to main script");
  self.postMessage(workerResult);
};
//in App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import WebWorker from "./components/WorkerSetup";
