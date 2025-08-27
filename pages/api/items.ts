import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

type Customer = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    status?: string;
};

const filePath = path.join(process.cwd(), "/tmp/db.json");

// helper to read JSON
function readData() {
  const fileData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileData);
}

// helper to write JSON
function writeData(data: Customer[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const items = readData();
    return res.status(200).json(items);
  }

  if (req.method === "PUT") {
    const { id, ...rest } = req.body;
    const items: Customer[] = readData();
    const index = items.findIndex((item: Customer) => item.id === id);
    if (index === -1) {
      const newItem = req.body;
      for(const customer of items) {
        if(customer.email === newItem.email) {
          return res.status(409).json({ error: "Email already exists" });
        }
      }
      writeData([...items, newItem]);
      return res.status(201).json(newItem);
    }
    items[index] = { ...items[index], ...rest };
    writeData(items);
    return res.status(200).json(items[index]);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    const items: Customer[] = readData();
    const filtered = items.filter((item: Customer) => item.id != id);
    writeData(filtered);
    return res.status(200).json({ message: "Item deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
