const login = async (email, password) => {
    try{
        const res = await axios({
            method:'POST',
            url:'/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        console.log(res)
        if(res.data.status === 'success'){
            showAlert('success','Logged In SuccessFully')
            window.setTimeout(function(){
                window.location.href='/home'
            },2000)
        }
    }
    catch(err){
        showAlert('error', err.response.data.message);
    }
}

document.querySelector('.loginForm').addEventListener('submit',( e )=> {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password)
})