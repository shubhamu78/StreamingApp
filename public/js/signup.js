const signup = async (email, password, name, passwordConfirm) => {
    try{
        const res = await axios({
            method:'POST',
            url:'/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })
        console.log(res)
        if(res.data.status === 'success'){
            showAlert('success','Account Created Succesfully')
            window.setTimeout(function(){
                window.location.href='/'
            },2000)
        }
    }
    catch(err){
        showAlert('error', err.response.data.message);
    }
}

document.querySelector('.loginForm').addEventListener('submit',( e )=> {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    console.log(email, password, name, passwordConfirm);
    signup(email, password, name, passwordConfirm)
})