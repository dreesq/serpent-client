import S from "../../index";

/**
 * Export the client
 */

export default new S('http://localhost:3004', {
     socket: true,
     debug: true
});