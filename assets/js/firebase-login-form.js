
// Get HTML objects
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const resultDiv = document.getElementById('result');
const loggedintitle= document.querySelector("#logout-form > h3")


// Check for existing session on page load
document.addEventListener('DOMContentLoaded', () => {
    if (authManager.checkSessionToken()){
        // resultDiv.innerHTML = `Logged in as ${user.email}`;
        logoutForm.style.display = 'block';
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        // loggedintitle.innerHTML = `Logged in as ${user.email}`
        apICallEnabled = true
    } else {
        resultDiv.innerHTML = 'Not logged in';
        logoutForm.style.display = 'none';
        loginForm.style.display = 'block';
        apICallEnabled = false
    }
    // });
});

// Sign up function
async function signUp() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        // authManager.signup(email, password)
        const usercreds = await authManager.signup(email, password);
        await user.saveEmail(usercreds.email);
        user.setToken(usercreds._delegate.accessToken )
        logoutForm.style.display = 'none';
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } catch (error) {
        console.error('Signup failed:', error.message);
        resultDiv.innerHTML = `Signup failed 🤔: ${error.message}`;
    }
}

// Login function
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const usercreds = await authManager.login(email, password);
        resultDiv.innerHTML = `Login successful for ${usercreds.email} 🫡`;
        await user.saveEmail(usercreds.email);
        user.setToken(usercreds._delegate.accessToken );
        logoutForm.style.display = 'block';
        loginForm.style.display = 'none';
    } catch (error) {
        console.error('Login failed:', error.message);
        resultDiv.innerHTML = `Login error: ${error.message} 🫨`;
    }
}
// Logout function
function logout() {
    if (authManager.logout()){
        logoutForm.style.display = 'none';
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        user.setToken(null);
        resultDiv.innerHTML = `You have logged out 🥲`;
    }else{
        resultDiv.innerHTML = `Something went wrong when logging you out 🫨`;
        // logoff didn't work correcctly -> show error
    }
}

// Google login method
async function handleCredentialResponse(response) {

    const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
    

    try{
        const firebasecreds = await authManager.signInWithCredential(credential)
        const usercreds = firebasecreds.user.multiFactor.user;
        console.log("usercreds", usercreds.accessToken)

        resultDiv.innerHTML = `Login successful for ${usercreds.email} 🫡`;
        await user.saveEmail(usercreds.email);
        user.setToken(usercreds.accessToken );
        logoutForm.style.display = 'block';
        loginForm.style.display = 'none';
    }catch( error) {
        console.error('Login failed:', error.message);
    }
}

window.onload = function() {
    google.accounts.id.initialize({
        client_id: "{{ site.authentication.firebase.google_client_id }}",
        callback: handleCredentialResponse
    }); 
    google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large" }
    );
};
        
        
