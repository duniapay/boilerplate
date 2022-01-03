/*
  Smoke test is a regular load test, configured for minimal load. 
  You want to run a smoke test as a sanity check every time you write a new script or modify an existing script.

  Run a smoke test to:
  - Verify that our test script doesn't have errors
  - Verify that our system doesn't throw any errors when under minimal load
*/

import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(99)<50'], // 99% of requests must complete below 50ms
  },
};

export default () => {
  let response = http.get('https://www.duniapay.net/');
  sleep(1);
};
