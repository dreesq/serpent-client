import 'babel-polyfill';
import client from "./client";

(async () => {
     setTimeout(async () => {
          const {errors, data} = await client.getTasks();
          console.log(data);
     }, 1000);
})();