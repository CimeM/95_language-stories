

class FirebaseAuthManager {
    constructor(apikey = '') {
        this.firebaseConfig={ apiKey: "AIzaSyBrrDkXi70FizXW3U-fus-mAWyZTlKfSzE" };
        // this.firebaseapi_key="{{ site.authentication.firebase.api_key }}";
        this.app = firebase.initializeApp(this.firebaseConfig);
        this.auth = firebase.auth();
        this.user = null;
        this.sessionToken = null;

        this.logging = false;
        
        // this.initAuthStateListener();
    }

    log(...args) {
        if (this.logging) {
            console.log(...args);
        }
    }
  
    initAuthStateListener() {
      this.auth.onAuthStateChanged(this.auth, (user) => {
        this.log("user", user)
        if (user) {
          this.user = user;
          this.sessionToken = user.accessToken;
          this.setCookie('sessionToken', this.sessionToken);
          this.log('User is signed in');
        } else {
          this.user = null;
          this.sessionToken = null;
          this.clearCookie('sessionToken');
          this.log('User is signed out');
        }
      });
    }
  
    async login(email, password) {
      try {
        const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
        this.renewToken();
        this.log('User logged in successfully');
        return userCredential.user;
      } catch (error) {
        console.error('Login error:', error.message);
        throw error;
      }
    }

    async signInWithCredential(credential) {
        try {
            this.auth().signInWithCredential(credential)
        } catch (error) {
            console.error('Login error:', error.message);
            throw error;
        }
    }
    
    async signup(email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(email, password);
        this.log('User signed up successfully');
        this.renewToken()
        return userCredential.user;
      } catch (error) {
        console.error('Signup error:', error.message);
        throw error;
      }
    }
  
    async logoff() {
      try {
        await this.auth.signOut(this.auth);
        this.log('User logged out successfully');
      } catch (error) {
        console.error('Logoff error:', error.message);
        throw error;
      }
    }
  
    async renewToken() {
      try {
        const currentUser = this.auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          this.sessionToken = newToken;
          this.setCookie('sessionToken', newToken);
          this.log('Token renewed successfully');
          return newToken;
        } else {
          throw new Error('No user is currently signed in');
        }
      } catch (error) {
        console.error('Token renewal error:', error.message);
        throw error;
      }
    }
  
    checkSessionToken() {
      const cookieToken = this.getCookie('sessionToken');
      this.log("cookieToken", cookieToken)
      if (cookieToken) {
        this.sessionToken = cookieToken;
        this.log('Session token found in cookies');
        return true;
      }
      this.log('No session token found in cookies');
      return false;
    }
  
    setCookie(name, value, days = 7) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; Secure; SameSite=Strict`;
    }
  
    getCookie(name) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
          return decodeURIComponent(cookieValue);
        }
      }
      return null;
    }
  
    clearCookie(name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict`;
    }
  }

// const authManager = new FirebaseAuthManager(firebaseapikeyID);
// // Check for existing session
// if (authManager.checkSessionToken()) {
//     console.log('User is already logged in');
// }

// // Login
// try {
//     await authManager.login('user@example.com', 'password123');
// } catch (error) {
//     console.error('Login failed:', error.message);
// }

// // Signup
// try {
//     await authManager.signup('newuser@example.com', 'newpassword123');
// } catch (error) {
//     console.error('Signup failed:', error.message);
// }

// // Renew token
// try {
//     const newToken = await authManager.renewToken();
//     console.log('New token:', newToken);
// } catch (error) {
//     console.error('Token renewal failed:', error.message);
// }

// // Logoff
// try {
//     await authManager.logoff();
// } catch (error) {   
//     console.error('Logoff failed:', error.message);
// }