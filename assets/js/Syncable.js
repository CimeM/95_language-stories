document.cookie = "SIDCC=value; SameSite=Lax; Secure";
document.cookie = "__Secure-1PSIDCC=value; SameSite=None; Secure";

class Syncable {
    constructor(data = {}, storageKey = 'syncableData', userId = null, apiEndpoint='', token='', tokenExpiration='') {
        this._data = data;
        this.userId = userId;
        this.storageKey = userId ? `${storageKey}_${userId}` : storageKey;
        this.apiEndpoint = apiEndpoint;
        this.syncQueue = [];
        this.isSyncing = false;
        this.syncBackoffCounter = 0;
        this.version = 0;
        this.isBrowserOnline = navigator.onLine;
        this.className = this.getDerivedClassName();
        this.syncinterval = null;
        
        this.logging = true;
        
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

    // load data from storage
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
        if (this.isBrowserOnline && !this.isSyncing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.syncQueue.length === 0 || this.isSyncing || !this.isBrowserOnline) return;

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
            // error if there is a problem syscing the data
            // type1: Offline: Network response was not ok
            //      reson 1: network is offline or cross domain.. 
            //      response: do nothing.
            // console.error('Error syncing batch:', error);
            this.log("Error:", error);
            this.syncQueue.unshift(...batch);
        } finally {
            // backoff to sync later
            this.isSyncing = false;
            this.syncBackoffCounter += 1;
            var backofSeconds = Math.pow(this.syncBackoffCounter, 2);
            this.log("retrying in: ", String(backofSeconds), "s" )
            // backoff after 10 attempts
            if(this.syncBackoffCounter > 7 ){
                console.error("Error: Requests failed after "+ this.syncBackoffCounter + " attempts. Backing off");
                return null
            }
            if (this.syncQueue.length > 0) {
                setTimeout(() => this.processQueue(), ( 1000 * backofSeconds ));
            }
        }
    }

    async fetchLatestData() {
        if (!this.isBrowserOnline) return;
        
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
    _userLoginEvent(){
        this.startPeriodicSync();
        // fetch from server 
        // override data from local
    }
    // placeholder function - trirgers when user is logged in
    _userLogoutEvent(){
        clearInterval(this.syncinterval); // stop syncing data with the database
        this._data = {} // remove data in the emmory
    }

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
            this.isBrowserOnline = true;
            this.processQueue();
            this.fetchLatestData();
        });
        window.addEventListener('offline', () => {
            this.isBrowserOnline = false;
        });
    }

    startPeriodicSync() {
        this.syncinterval = setInterval(() => {
            // if browser is online 
            // and if user is logged in ...
            if (this.isBrowserOnline && authManager.isUserLoggedIn() ) {
                this.processQueue();
                this.fetchLatestData();
            }
        }, 600000); // 10 min = 600000
    }
}

// const mySyncableData = new Syncable({ name: 'Alice', age: 30 });
// Update properties which will trigger sync and save to localForage
// mySyncableData.data = { name: 'Bob' }; // This will trigger sync and save locally
