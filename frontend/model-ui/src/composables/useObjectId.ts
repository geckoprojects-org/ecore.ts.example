import type { EObject } from "@/ecore";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

// Map to store EObject IDs for node identification
const objectIdMap = new WeakMap<EObject, string>();
const idObjectMap = new Map<string, EObject>();

export function useObjectId() {
  function getObjectId(eObj: EObject): string {
    let id = objectIdMap.get(eObj);
    if (!id) {
      id = uid.rnd();
      objectIdMap.set(eObj, id);
      idObjectMap.set(id, eObj);
    }
    return id;
  }

  function getObjectById(id: string): EObject | undefined {
    return idObjectMap.get(id);
  }

  return {
    getObjectId,
    getObjectById
  };
}