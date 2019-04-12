import 'babel-polyfill';
import client from "./client";

window.client = client;

const {d} = client._utils;

client.ready(async () => {
     window.login = async () => {
          if (localStorage.getItem('token')) {
               return d('Already logged in');
          }

          d('Logging in.');
          const {errors, data} = await client._auth.login({
               provider: 'local',
               email: 'me@me.com',
               password: 'password'
          });

          if (errors) {
               return d('Error', errors);
          }

          d('Logged in', data);
     };

     login();
});

