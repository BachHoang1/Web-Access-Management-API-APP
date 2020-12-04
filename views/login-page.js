const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

// loginButton.addEventListener("click", (e) => {
//     e.preventDefault();
//     const username = loginForm.username.value;
//     const password = loginForm.password.value;

//     if (username === "user" && password === "web_dev") {
//         alert("You have successfully logged in.");
//         location.reload();
//     } else {
//         loginErrorMsg.style.opacity = 1;
//     }
// })
if (urlParams.has('credential')){
    // document.getElementById("login-error-msg-box").classList.remove("hidden");
    loginErrorMsg.style.opacity = 1;
}

/*

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
  const username = signInButton.username.value;
    const password = signInButton.password.value;

    if (username === "user" && password === "web_dev") {
        alert("You have successfully logged in.");
        location.reload();
    } else {
        loginErrorMsg.style.opacity = 1;
    }
}); */