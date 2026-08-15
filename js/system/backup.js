/* =========================================
   ASTRA BACKUP SYSTEM v2.1
   Persistent backup + restore
========================================= */

const BackupModule = {

    key: "ASTRA_BACKUP_V2.0",

    readJSON(key, fallback = {}) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch {
            return fallback;
        }
    },

    create() {
        const backup = {
            version: "ASTRA_BACKUP_V2.1",
            date: new Date().toISOString(),
            mode: localStorage.getItem("ASTRA_MODE") || "TRADING",
            databases: {
                memory: this.readJSON("ASTRA_MEMORY"),
                journal: this.readJSON("ASTRA_JOURNAL"),
                performance: this.readJSON("ASTRA_PERFORMANCE"),
                updates: this.readJSON("ASTRA_UPDATES", [])
            }
        };

        localStorage.setItem(this.key, JSON.stringify(backup));

        AstraReply("ASTRA backup created successfully.");
        return backup;
    },

    restore() {
        const backup = this.readJSON(this.key, null);

        if (!backup || !backup.databases) {
            AstraReply("No valid ASTRA backup found.");
            return false;
        }

        try {
            localStorage.setItem("ASTRA_MEMORY", JSON.stringify(backup.databases.memory ?? {}));
            localStorage.setItem("ASTRA_JOURNAL", JSON.stringify(backup.databases.journal ?? {}));
            localStorage.setItem("ASTRA_PERFORMANCE", JSON.stringify(backup.databases.performance ?? {}));
            localStorage.setItem("ASTRA_UPDATES", JSON.stringify(backup.databases.updates ?? []));

            if (backup.mode) {
                localStorage.setItem("ASTRA_MODE", String(backup.mode).toUpperCase());
            }

            AstraReply(`ASTRA backup restored successfully.\nBackup date: ${backup.date}`);
            return true;
        } catch (error) {
            console.error("ASTRA backup restore failed:", error);
            AstraReply("ASTRA backup restore failed.");
            return false;
        }
    }
};

ASTRA.registerModule("backup", BackupModule);

console.log("ASTRA Backup System v2.1 Loaded");
