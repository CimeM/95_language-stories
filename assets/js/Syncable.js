document.cookie = "SIDCC=value; SameSite=Lax; Secure";
document.cookie = "__Secure-1PSIDCC=value; SameSite=None; Secure";

class Syncable {
    constructor(data = {}, storageKey = 'syncableData', userId = null, token='', tokenExpiration='') {
        this._data = data;
        this.userId = userId;
        this.storageKey = userId ? `${storageKey}_${userId}` : storageKey;
        this.apiEndpoint = document.querySelector("#apiadress").innerHTML;
        this.syncQueue = [];
        this.isSyncing = false;
        this.version = 0;
        this.isOnline = navigator.onLine;
        this.className = this.getDerivedClassName();

        
        this.logging = false;
        
        this.initialized = false;

        // create promisse to collect data at least from local storage
        this.dataInitializePromise = this.loadData();
        this.startPeriodicSync();
        this.setupNetworkListeners();
        
        this.token = token;
        this.tokenExpiration = tokenExpiration;
        
    }

    log(...args) {
        if (this.logging) {
            console.log(...args);
        }
    }

    async loadData() {
        try {
            const dataUpToNow = this.data;
            const storedData = await localforage.getItem(this.storageKey);
            if (storedData) {
                this._data = storedData.data;
                this.version = storedData.version;
                // insert data that is not there in the memory
                Object.keys(dataUpToNow).forEach(key =>{
                    if ( !Object.keys(this._data).includes(key) ){
                        this._data[key] = dataUpToNow[key];
                    }
                })
                this.log('Loaded data from localForage:', this._data);
            }
        } catch (error) {
            console.error('Error loading data from localForage:', error);
        }
        this.initialized = true;
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
            const response = await fetch(this.apiEndpoint + "/data", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.token}`
                },
                body: JSON.stringify({
	                className: this.className,
	                batch: batch 
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const serverData = await response.json();
            this.mergeServerData(serverData);
            this.log('Batch synced successfully with API:', serverData);
        } catch (error) {
            console.error('Error syncing batch:', error);
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
            const response = await fetch(`${this.apiEndpoint}/data?className=${this.className}&version=${this.version}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.token}`
                }
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
            const serverData = await response.json();
            this.mergeServerData(serverData);
        } catch (error) {
            console.error('Error fetching latest data:', error);
        }
    }

    // placeholder function - trirgers when user is logged in
    _userLoginEvent(){}
    // placeholder function - trirgers when user is logged in
    _userLogoutEvent(){}

    setToken(inputToken){
        this.log("calling setToken()")
        // this defines if user is logged in or not
        try {
            this.token = inputToken
            if(inputToken != null ){ this._userLoginEvent() }else{ this._userLogoutEvent() }
            // if( inputToken != undefined ){
            // }else{
            //     throw new Error(`User token is malformed: ${inputToken}`)
            // }
        } catch(error){
            this.log("error setToken(): ", error)
        }
    }

    mergeServerData(serverData) {
        if (serverData.version > this.version) {
            this._data = { ...this._data, ...serverData.data };
            this.version = serverData.version;
            this.saveToLocal();
        }
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
        }, 600000); // 10 min = 600000
    }
}

// const mySyncableData = new Syncable({ name: 'Alice', age: 30 });
// Update properties which will trigger sync and save to localForage
// mySyncableData.data = { name: 'Bob' }; // This will trigger sync and save locally
