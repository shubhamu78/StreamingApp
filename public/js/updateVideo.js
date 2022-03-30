const updateVideo = async(data, videoId) => {
    try{
        const res = await axios({
            method: 'PATCH',
            url:   `/api/v1/video/${videoId}`,
            data
        });
        if(res.data.status === 'success'){
            showAlert('success', 'Video Name Successfully Updated');
        }
    }
    catch(err){
        showAlert('error',err.response.data.message);
    }
}

document.querySelector('.updateBtn').addEventListener('click', e=> {
    e.preventDefault();
    const videoId = document.getElementById('videoId').value;
    const name = document.getElementById('name').value;
   
    const data = {};
    data.name = name;
   
    updateVideo(data, videoId);
})

const deleteVideo = async(videoId) => {
    try{
        const res = await axios({
            method: 'DELETE',
            url:   `/api/v1/video/${videoId}`
        });
        if(res.data.status === 'success'){
            showAlert('success', 'Video Deleted');
            window.location.href = '/myVideos';
        }
    }
    catch(err){
        showAlert('error',err.response.data.message);
    }
}


document.querySelector('.deleteBtn').addEventListener('click', e=> {
    e.preventDefault();
    const videoId = document.getElementById('videoId').value;
    console.log(videoId)
   
   deleteVideo(videoId)
})

const updateVideoThumbnail = async(data, type, videoId) => {
    console.log("INsidoe:"+videoId)
    try{
        const res = await axios({
            method: 'PATCH',
            url:   `/api/v1/video/updateThumbnail/${videoId}`,
            data
        });
        if(res.data.status === 'success'){
            showAlert('success', 'Thumbnail Successfully Updated');
        }
    }
    catch(err){
        showAlert('error',err.response.data.message);
    }
}

document.querySelector('.updateThumbBtn').addEventListener('click', e => {
    e.preventDefault();
    const videoId = document.getElementById('videoId').value;
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('thumbnailName', document.getElementById('thumbnailName').files[0]);  
    updateVideoThumbnail(form, 'data', videoId);
})