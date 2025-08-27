import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

const filePath = path.join(process.cwd(), "db.json");

// helper to read JSON
function readData() {
  const fileData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileData);
}

// helper to write JSON
function writeData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const items = readData();
    return res.status(200).json(items);
  }

  if (req.method === "PUT") {
    const { id, ...rest } = req.body;
    let items = readData();
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) {
      const newItem = req.body;
      for(let customer of items) {
        if(customer.email === newItem.email) {
          return res.status(409).json({ error: "Email already exists" });
        }
      }
      items.push(newItem);
      writeData(items);
      return res.status(201).json(newItem);
    }
    items[index] = { ...items[index], ...rest };
    writeData(items);
    return res.status(200).json(items[index]);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    let items = readData();
    const filtered = items.filter((item: any) => item.id != id);
    writeData(filtered);
    return res.status(200).json({ message: "Item deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
