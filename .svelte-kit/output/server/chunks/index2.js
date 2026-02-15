import Dexie from "dexie";
class OscarDatabase extends Dexie {
  projects;
  trees;
  notes;
  photos;
  reports;
  tasks;
  links;
  chatMessages;
  constructor() {
    super("OscarAI");
    this.version(3).stores({
      projects: "id, name, createdAt, updatedAt",
      trees: "id, projectId, number, species, createdAt",
      notes: "id, projectId, title, *tags, createdAt",
      photos: "id, projectId, treeId, createdAt",
      reports: "id, projectId, type, generatedAt",
      tasks: "id, status, priority, projectId, *tags, createdAt",
      links: "id, sourceId, targetId, sourceType, targetType, relationType",
      chatMessages: "id, role, timestamp"
    });
  }
}
const db = new OscarDatabase();
async function getAllNotes() {
  return db.notes.orderBy("updatedAt").reverse().toArray();
}
async function getNotesByTag(tag) {
  return db.notes.where("tags").equals(tag).toArray();
}
export {
  getAllNotes as a,
  getNotesByTag as g
};
