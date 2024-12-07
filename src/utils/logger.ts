const DISABLE_LOGS = false;

function createLogger() {
  return {
    log: function (...data: any[]) {
      if (!DISABLE_LOGS) {
        console.log(...data);
      }
    },
    error: function (...data: any[]) {
      if (!DISABLE_LOGS) {
        console.error(...data);
      }
    },
    warn: function (...data: any[]) {
      if (!DISABLE_LOGS) {
        console.warn(...data);
      }
    },
  };
}

const logger = createLogger();

export default logger;
