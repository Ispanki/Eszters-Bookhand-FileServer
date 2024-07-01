import { Application } from "oak";
import { config } from "dotenv";
import { oakCors } from "cors";
import CRUD from "./router.ts";

const { IP, PORT } = config();
const app = new Application();

/** Setup application */
app.use(oakCors({ origin: true }));
app.use(CRUD.routes());
app.use(CRUD.allowedMethods());
console.log(`App running on: ${IP}:${PORT}`);
await app.listen(`${IP}:${PORT}`);
