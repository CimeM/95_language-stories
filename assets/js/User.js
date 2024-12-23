
class UserAccount extends Syncable {
	
    constructor(token, tokenExpiration, user){
       super(
            { 'pointGettingActivity':[], 
                'points': 0, 
                'numberOfRemainingLivesToday':3, 
                'lastTimeLiveWasSpent': null,
                'numberOfRemainingStories':3 
            }, 
            'syncableData',
            null, 
            token, 
            tokenExpiration
        )
        
        this.name = ""
        
        // console.log("user", user)
        this.resetUsersHearts();
        // this.mapUserObject()
        
    }
    async saveEmail(email){
        await this.dataInitializePromise;
        this.data = {email: email}
    }

    async getAvatar(){

    }
    async getAvatar(randomize){
        await this.dataInitializePromise;
        if ( !Object.keys(this.data).includes('avatar') || randomize == true){
            // create avatar on the spot
            var randomNum = Math.random(0,123);
            this.data = {avatar: { seed: randomNum, style: 'micah' } }
        }
        return this.data.avatar
        
    }

    async resetUsersHearts(){
        await this.dataInitializePromise;
       
        const today = new Date().toISOString().slice(0,10);
        const lastDay = new Date(this.data.lastTimeLiveWasSpent).toISOString().slice(0,10);
        if( lastDay != today ){
            this.data = { 'numberOfRemainingLivesToday': 3, 'lastTimeLiveWasSpent': today }; 
        }
    }

    addPoints( numberOfPointsToAdd ){
        this.addContributionTimestamp()
        console.log(this.data)
        const newValue = this.data.points? numberOfPointsToAdd+this.data.points : numberOfPointsToAdd;
        this.data = { points: newValue };
    }
    addContributionTimestamp(){
        var tskey = new Date().toISOString().slice(0,10); // 2024-12-21
        var newActivity = []
        this.log("pointGettingActivity in obj", Object.keys(this.data) )
        this.log( "pointGettingActivity" in Object.keys(this.data) )
        if( Object.keys(this.data).includes("pointGettingActivity") ){ // if this exists....
            // find out if timestamp exists
            var tsExists = this.data.pointGettingActivity.filter(x => new Date(x.date).toISOString().slice(0,10) == tskey )
            var newCount = tsExists.length > 0 ? tsExists[0].count + 1 : 1;
            var newObj = { date: tskey, count: newCount }
            this.log('tsExists in pointGettingActivity', tsExists.length > 0)
            if(tsExists.length > 0) { //ts exists in array, just increment the count
                // correct the count
                var old_array = this.data.pointGettingActivity.filter(x => new Date(x.date).toISOString().slice(0,10) != tskey );
                this.log("old_array", old_array)
                newActivity = [...old_array,newObj ]
            } else{ // ts does not exist, create the entry for that day (append to existing)
                newActivity = [...this.data.pointGettingActivity,newObj ]
            }
        }else{ // pointGettingActivity does not exist
            var newActivity = [{ date: tskey, count: 1 }]
        }
        this.data = { pointGettingActivity: newActivity } 
    }
    // getter of user contribution graph data
    async createContributionMap(){

        // Wait for initialization to complete
        await this.dataInitializePromise;
        
        var result = []
        this.data.pointGettingActivity.forEach(dp => {
            result.push({date: new Date(dp.date), count: dp.count })         
        });
        return result
    }
    // getter of user contribution graph data
    async getUserName(){
        // Wait for initialization to complete
        await this.dataInitializePromise;
        if(Object.keys(this.data).includes('email')){
            return user.data.email
        }
        return "Language learner" //this.data.username;
    }
    // getter of user contribution graph data
    async getUserPoints(){
        // Wait for initialization to complete
        await this.dataInitializePromise;
        return this.data.points;
    }
    // decreases lives and returns remaining lives
    spendALife(){
        var lives = this.data.numberOfRemainingLivesToday;
        if(lives > 0){
            this.data = { numberOfRemainingLivesToday: (lives-1), lastTimeLiveWasSpent: new Date().toISOString() };
            return lives-1
        }else{
            return 0
        }
    }
    async getLives(){
        await this.dataInitializePromise;
        return this.data.numberOfRemainingLivesToday
    }
  }