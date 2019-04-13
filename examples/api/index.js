import 'babel-polyfill';
import client from "./client";

window.client = client;

const {d, debugPanel} = client._utils;

client.ready(async () => {
     window.login = async () => {
          if (localStorage.getItem('token')) {
               return d('info', 'Already logged in');
          }

          d('info', 'Logging in.');
          const {errors, data} = await client._auth.login({
               provider: 'local',
               email: 'me@me.com',
               password: 'password'
          });

          if (errors) {
               return d('error', 'Error', errors);
          }

          d('info', 'Logged in', data);
     };

     login();
});

debugPanel();
