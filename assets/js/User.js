
class UserAccount extends Syncable {
	
    constructor(token= ""){
       super()
       this.name=""
       this.token=token;
    }
    
    addPoints( numberOfPointsToAdd ){
        this.addContributionTimestamp()
        console.log(this.data)
        const newValue = this.data.points? numberOfPointsToAdd+this.data.points : numberOfPointsToAdd;
        this.data = { points: newValue };
    }
    addContributionTimestamp(){
        var tskey = new Date().toISOString().slice(0,10);
        if( "pointGettingActivity" in Object.keys(this.data) ){
            var tsExists = this.data.pointGettingActivity.filter(x => x.date == tskey )
            var newCount = tsExists.length>0 ? tsExists[0].count + 1 : 1;
        }else{ 
            var newCount = 1;
            var tsExists = false
        }
        var newObj = { date: tskey, count: newCount }
        var newActivity = []
        if(tsExists.length>0) {
            // correct the count
            var old_array = this.data.pointGettingActivity.filter(x => x.date != tskey );
            newActivity = [...old_array,newObj ]
        } else{
            // apend the new object
            newActivity = [newObj]
        }
        this.data = { pointGettingActivity: newActivity } 
    }
    createContributionMap(){
        var result = []
        this.data.pointGettingActivity.forEach(dp => {
            result.push({date: new Date(dp.date), count: dp.count })         
        });
        console.log("result" , result)
        return result
    }
  }