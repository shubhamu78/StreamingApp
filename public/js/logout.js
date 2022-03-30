const logout = async () =>{
    console.log('Logging Out')
    try{
        const res = await axios({
            method:'GET',
            url:'/api/v1/users/logout'
        });

        if(res.data.status === 'success'){
            location.reload(true);
            window.location.href = '/';
        } 
        
    }
    catch(err){
        console.log(err);
        showAlert('error', 'Failed To Logout! Try Again!')
    }
}

document.querySelector('.logoutbtn').addEventListener('click', e => {
    e.preventDefault();
    console.log('Logging out')
    logout();
})