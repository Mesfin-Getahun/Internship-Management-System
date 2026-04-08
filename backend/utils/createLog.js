import { insertSystemLog } from "./systemLogService.js";
const createLog = async (userId, action, description) => {
  try {
    await insertSystemLog({
      actorId: userId,
      action,
      description,
    });
  } catch (error) {
    console.error("Log error:", error);
  }
};

export default createLog;
