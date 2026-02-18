// backup-manager.js

class BackupManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    save(data) {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(this.storageKey, jsonData);
    }

    load() {
        const jsonData = localStorage.getItem(this.storageKey);
        return jsonData ? JSON.parse(jsonData) : null;
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }
}

// Usage example:
const backupManager = new BackupManager('myBackupKey');
backupManager.save({ key: 'value' });
const data = backupManager.load();
console.log(data); // { key: 'value' }
backupManager.clear();