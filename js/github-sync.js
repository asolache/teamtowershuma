// github-sync.js - Sincronización con GitHub API

class GitHubSync {
    constructor(token, repo, branch = 'main') {
        this.token = token;
        this.repo = repo;
        this.branch = branch;
        this.baseURL = 'https://api.github.com/repos';
    }

    async uploadBackup(backupData, filename) {
        try {
            const content = btoa(JSON.stringify(backupData, null, 2));
            const path = `data/backups/${filename}`;
            
            const response = await fetch(`${this.baseURL}/${this.repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `🤖 Auto backup: ${new Date().toISOString()}`,
                    content: content,
                    branch: this.branch
                })
            });

            if (response.ok) {
                console.log(`✅ Backup subido: ${filename}`);
                return true;
            } else {
                console.error(`❌ Error al subir: ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Error de sincronización: ${error.message}`);
            return false;
        }
    }

    async getBackupHistory(limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/${this.repo}/contents/data/backups`, {
                headers: {
                    'Authorization': `token ${this.token}`
                }
            });
            
            if (response.ok) {
                const files = await response.json();
                return files.slice(0, limit);
            }
        } catch (error) {
            console.error(`❌ Error al obtener historial: ${error.message}`);
        }
    }
}

// Exponer globalmente
window.GitHubSync = GitHubSync;