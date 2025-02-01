class CouponHandler {
    constructor() {
        this._data = data;
        this.userId = userId;
        this.storageKey = userId ? `${storageKey}_${userId}` : storageKey;
    }

    log(...args) {
        if (this.logging) {
            console.log(...args);
        }
    }
    async validateCoupon(code){
        const userid = userid.id;
        const token = userid.token;
        try {
            const response = await fetch(`${this.apiEndpoint}/couponcode?code=${code}&userid=${userid}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await token}`
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const serverData = await response.json();
            if(serverData.validated == true){
                return true
            }else{
                return false
            }
        } catch (error) {
            console.error('Error fetching latest data:', error);
            return false
        }
    }
}