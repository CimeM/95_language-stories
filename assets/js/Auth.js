class FirebaseAuthManager {
    constructor(apikey = '') {
        this.firebaseConfig={ apiKey: apikey };
        // this.firebaseapi_key="{{ site.authentication.firebase.api_key }}";
        this.app = firebase.initializeApp(this.firebaseConfig);
        this.auth = firebase.auth();
        this.sessionToken = null;
        this.sessionTokenExpiration = null;

        this.logging = false;
        this.checkSessionToken()        
        // this.initAuthStateListener();
    }

    log(...args) {
        if (this.logging) {
            console.log(...args);
        }
    }
  
    // initAuthStateListener() {
    //   this.auth.onAuthStateChanged(this.auth, (user) => {
    //     this.log("user", user)
    //     if (user) {
    //       this.user = user;
    //       this.sessionToken = user.accessToken;
    //       this.setCookie('sessionToken', this.sessionToken);
    //       this.setCookie('cookieTokenExpiration', new Date(Date.now() + 1 * 864e5/24).toUTCString());
    //       this.log('User is signed in');
    //     } else {
    //       this.user = null;
    //       this.sessionToken = null;
    //       this.clearCookie('sessionToken');
    //       this.log('User is signed out');
    //     }
    //   });
    // }

    async login(email, password) {
      this.log("login:", email);
      try {
        const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
        this.renewToken();
        // this.log('User logged in successfully', userCredential.user._delegate.accessToken);
        return userCredential.user;
      } catch (error) {
        console.error('Login error:', error.message);
        throw error;
      }
    }

    async signInWithCredential(credential) {
      this.log("signInWithCredential", credential);
      // Save Google access token in cookies
      const googleAccessToken = credential;
      document.cookie = `googleAccessToken=${encodeURIComponent(googleAccessToken)}; path=/; Secure; SameSite=Strict`;
      

      try {
        const firebaseauth = await this.auth.signInWithCredential(credential)
        // save token
        var netoken = firebaseauth.user.multiFactor.user.accessToken
        this.sessionToken = netoken; 
        this.setCookie('sessionToken', netoken);
        this.setCookie('cookieTokenExpiration', new Date(Date.now() + 1 * 864e5/24).toUTCString());
        this.log('Token set successfully');

        // Set up an observer on the Auth object to listen for changes in the user's sign-in state
        this.auth.onIdTokenChanged(async (user) => {
          if (user) {
              // User is signed in, get fresh ID token
              this.sessionToken = await user.getIdToken(true); // true forces refresh
              console.log("New ID Token retrived:", idToken);
          } else {
              console.log("Tokn wasn't retrived - user is signed out.");
          }
        });


        return firebaseauth
      } catch (error) {
          console.error('Login error:', error.message);
          throw error;
      }
    }
    
    async signup(email, password) {
      try {
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
        this.log('User signed up successfully');
        this.renewToken()
        return userCredential.user;
      } catch (error) {
        console.error('Signup error:', error.message);
        throw error;
      }
    }
  
    async logout() {
      try {
        await this.auth.signOut(this.auth);
        this.clearCookie('sessionToken');
        this.log('User logged out successfully');
        return true;
      } catch (error) {
        console.error('Logout error:', error.message);
        throw error;
      }
      return false;
    }
  
    async renewToken() {
      this.log('renewToken:', this.auth.currentUser);
      this.auth = await firebase.auth()
      try {
        const currentUser = this.auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          this.sessionToken = newToken;
          this.setCookie('sessionToken', newToken);
          this.setCookie('cookieTokenExpiration', new Date(Date.now() + 1 * 864e5/24).toUTCString());
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
    
    isUserLoggedIn(){
     return this.checkSessionToken();
    }

    checkSessionToken() {
      const cookieToken = this.getCookie('sessionToken');
      const cookieTokenExpiration = this.getCookie('cookieTokenExpiration');
      
      if ( cookieToken && cookieTokenExpiration ) {
        this.sessionToken = cookieToken;
        this.sessionTokenExpiration = cookieTokenExpiration;
        this.log("token found in cookies at initialization", cookieToken, 'cookieTokenExpiration', cookieTokenExpiration )
        if(new Date(cookieTokenExpiration) < new Date() ){
          this.log('Token has expired, fetching new one...')
          this.renewToken()
        }
        return true;
      }
      this.log('No session token found in cookies');
      return false;
    }
  
    setCookie(name, value, days = 1) {
      this.log('setCookie:', name, value);
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; Secure; SameSite=Strict`;
      this.log("document.cookie", document.cookie)
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

  // const authManager = new FirebaseAuthManager("{{ site.authentication.firebase.api_key }}");

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