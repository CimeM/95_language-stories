// get token from authetication entity (firebase)
async function autoLoginn() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const idToken = await user.getIdToken(true);
            return idToken;
        } catch (error) {
            console.log(error)
        }
    } else {
        console.log('User not logged in');
        return null;
    }
    return null;
}

document.cookie = "SIDCC=value; SameSite=Lax; Secure";
document.cookie = "__Secure-1PSIDCC=value; SameSite=None; Secure";

class Syncable {
    constructor(data = {}, storageKey = 'syncableData', userId = null) {
        this._data = data;
        this.userId = userId;
        this.storageKey = userId ? `${storageKey}_${userId}` : storageKey;
        this.apiEndpoint = "https://langapi.rivieraapps.com/data";
        this.syncQueue = [];
        this.isSyncing = true;
        this.version = 0;
        this.isOnline = navigator.onLine;
        this.className = this.getDerivedClassName();

        this.logging = true;

        this.loadData();
        this.startPeriodicSync();
        this.setupNetworkListeners();
    }

    log(...args) {
        if (this.logging) {
            console.log(...args);
        }
    }

    async loadData() {
        try {
            const storedData = await localforage.getItem(this.storageKey);
            if (storedData) {
                this._data = storedData.data;
                this.version = storedData.version;
                this.log('Loaded data from localForage:', this._data);
            }
        } catch (error) {
            console.error('Error loading data from localForage:', error);
        }
    }

    get data() {
        return this._data;
    }

    set data(newData) {
        const oldData = JSON.stringify(this._data);
        this._data = { ...this._data, ...newData };
        this.version++;
        this.saveToLocal();
        if (oldData !== JSON.stringify(this._data)) {
            this.queueSync();
        }
    }
    
    // gets the name of the class that is derived from this class
    getDerivedClassName() {
        return this.constructor.name;
    }

    async saveToLocal() {
        try {
            await localforage.setItem(this.storageKey, { data: this._data, version: this.version });
            this.log('Data saved to localForage:', this._data);
        } catch (error) {
            console.error('Error saving data to localForage:', error);
        }
    }

    queueSync() {
        this.syncQueue.push({ data: { ...this._data }, version: this.version });
        if (this.isOnline && !this.isSyncing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.syncQueue.length === 0 || this.isSyncing || !this.isOnline) return;

        this.isSyncing = true;
        const batchSize = 10;
        const batch = this.syncQueue.splice(0, batchSize);

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
	                className: this.className,
	                batch: batch 
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const serverData = await response.json();
            this.mergeServerData(serverData);
            this.log('Batch synced successfully:', serverData);
        } catch (error) {
            this.error('Error syncing batch:', error);
            this.syncQueue.unshift(...batch);
        } finally {
            this.isSyncing = false;
            if (this.syncQueue.length > 0) {
                setTimeout(() => this.processQueue(), 1000);
            }
        }
    }

    async fetchLatestData() {
        if (!this.isOnline) return;
    
        try {
            const response = await fetch(`${this.apiEndpoint}?version=${this.version}&className=${this.className}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
            const serverData = await response.json();
            this.mergeServerData(serverData);
        } catch (error) {
            console.error('Error fetching latest data:', error);
        }
    }
    

    mergeServerData(serverData) {
        if (serverData.version > this.version) {
            this._data = { ...this._data, ...serverData.data };
            this.version = serverData.version;
            this.saveToLocal();
        }
    }

    getAuthToken() {
        // Implement your authentication token retrieval logic here
        return 'your-auth-token';
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
            this.fetchLatestData();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    startPeriodicSync() {
        setInterval(() => {
            if (this.isOnline) {
                this.processQueue();
                this.fetchLatestData();
            }
        }, 30000); // 10 min = 600000
    }
}

const mySyncableData = new Syncable({ name: 'Alice', age: 30 });

// Update properties which will trigger sync and save to localForage
mySyncableData.data = { name: 'Bob' }; // This will trigger sync and save locally
