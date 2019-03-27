var socket = io('http://localhost:3000');
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('messageForm');

uploader.on('start', function(fileInfo) {
    console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
    document.getElementById("spinner").style.display="block";
    console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});
//crea un boton en el mensaje con el nombre del archivo
uploader.on('complete', function(fileInfo) {
    console.log('Upload Complete', fileInfo);
    document.getElementById("spinner").style.display="none";
    socket.emit('send message', '<button  onclick="GetFile(\'' + fileInfo.name + '\')">'+fileInfo.name+'</button>');
});
uploader.on('error', function(err) {
    console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
    console.log('Aborted: ', fileInfo);
});

//evento de click del upload
document.getElementById("BtnUpload").onclick = function(ev) {
    ev.preventDefault();
    var fileEl = document.getElementById('file');
    var uploadIds = uploader.upload(fileEl, {
        data: { /* Arbitrary data... */ }
    });
   

    // setTimeout(function() {
    // uploader.abort(uploadIds[0]);
    // console.log(uploader.getUploadInfo());
    // }, 1000);
};
//Funcion para llamar al node el parametro es el nombre del archivo
function GetFile(name){   
    //cambia la ip deacuerdo ala compu servidor
window.open('http://10.21.6.60:3000/Archivos?archivo='+name+'');
}