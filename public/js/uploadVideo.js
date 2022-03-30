const uploadVideo = async(data, type) => {
    console.log("HERE")
    try{
        const res = await axios({
            method: 'POST',
            url:   `/api/v1/video`,
            data
        });
        if(res.data.status === 'success'){
            showAlert('success', 'Video Uploaded Succesfully');
        }
    }
    catch(err){
        showAlert('error',err.response.data.message);
    }
}

document.querySelector('.uploadBtn').addEventListener('click', e => {
    e.preventDefault();
    console.log('Clicked');
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('videoName', document.getElementById('videoName').files[0]);  
    uploadVideo(form, 'data');
})