import S from "../../index";

/**
 * Export the client
 */

export default new S('http://localhost:3000', {
     socket: true,
     debug: true,
     refresh: true
});