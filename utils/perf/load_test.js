/*
  Load Testing is primarily concerned with assessing the current performance of our system in terms of concurrent users or requests per second.
  When you want to understand if our system is meeting the performance goals, this is the type of test you'll run.

  Run a load test to:
  - Assess the current performance of our system under typical and peak load
  - Make sure you are continuously meeting the performance standards as you make changes to our system

  Can be used to simulate a normal day in our business
*/

import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  stages: [
    { duration: '1m', target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 1 minutes.
    { duration: '2m', target: 100 }, // stay at 100 users for 2 minutes
    { duration: '1m', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<150'], // 99% of requests must complete below 150ms
  },
};

export default () => {
  let response = http.get('https://www.duniapay.net/');

  sleep(1);
};
