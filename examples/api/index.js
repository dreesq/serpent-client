import 'babel-polyfill';
import client from "./client";

window.client = client;

client.ready(async () => {
     const d = window.d = (...args) => {
          const el = document.getElementById('output');
          el.innerHTML += "\n" + "=== MESSAGE ===  \n" + JSON.stringify(args, null, 2); + "\n";
     };

     window.login = async () => {
          if (localStorage.getItem('token')) {
               return d('Already logged in');
          }

          d('Logging in.');
          const {errors, data} = await client.login({
               provider: 'local',
               email: 'mail@mail.com',
               password: 'password'
          });

          if (errors) {
               return d('Error', errors);
          }

          d('Logged in', data);
     };


     login();
});

