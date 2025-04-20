import { Result } from "./types";

const sseConnections = new Map();

export function addSSEConnection(foodId:string,userId:string,res:any) {
  const key = `${foodId}-${userId}`;
  if (!sseConnections.has(key)) {
    sseConnections.set(key,{});
  }
  sseConnections.set(key,res);
}

export function removeSSEConnection(foodId:string,userId:string,res:any) {
  const key = `${foodId}-${userId}`;
  if (sseConnections.has(key)) {
      sseConnections.delete(key);
  }
}

export function notifySSEClients(foodId:string,userId:string,result:Result) {
  const key = `${foodId}-${userId}`;
  if (sseConnections.has(key)) {
    const res = sseConnections.get(key);
    res.write(`data: ${JSON.stringify(result)}\n\n`);
    sseConnections.delete(key);
  }
}