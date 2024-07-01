import { Context, Router, Response } from "oak";
import { exists } from "fs";

const CRUD = new Router();
CRUD.get("/:name", async (context) => {
  const name = context.params.name;
  return await Read({ name, response: context.response });
})
  .post("/update", Update)
  .post("/delete", Delete);

/**
 *  Reads a saved file and returns it
 *  It it call with ?poster=true and it is a video returns the cover image
 */
async function Read({ name, response }: { name: string; response: Response }) {
  if (!name) {
    response.status = 400;
    response.body = { error: "Missing name parameter" };
    return response;
  }

  const filePath = `./files/${name}`;

  try {
    const fileExists = await exists(filePath);
    if (!fileExists) {
      response.status = 404;
      response.body = { error: "File not found" };
      return response;
    }
    const file = await Deno.readFile(filePath);
    response.body = file;
  } catch (error) {
    response.status = 500;
    response.body = { error: "Internal server error" };
  }
}
/**
 * Writes or rewrites the file
 * it requires a name and a base64 file with the extension data
 */
async function Update({ request, response }: Context) {
  const { name, file } = await request.body.json();

  const ext = file.split(";")[0].split("/")[1];
  const filePath = `./files/${name}.${ext}`;
  const base64Data = file.split(",")[1];

  const raw = atob(base64Data);
  const rawLength = raw.length;
  const data = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    data[i] = raw.charCodeAt(i);
  }

  try {
    await Deno.writeFile(filePath, data);
    response.status = 200;
    response.body = { message: "File saved successfully" };
  } catch (error) {
    response.status = 500;
    response.body = { error: "Internal server error" };
  }
}
/**
 * Deletes a saved file
 */
async function Delete({ request, response }: Context) {
  const { name } = await request.body.json();

  try {
    await Deno.remove(`./files/${name}`);
    // deno-lint-ignore no-unused-vars
  } catch (error) {
    response.status = 500;
    response.body = { error: "Internal server error" };
  }

  response.status = 200;
  response.body = { message: "File deleted successfully" };
}

export default CRUD;
