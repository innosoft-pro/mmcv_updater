// Taken and modified from :
// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function writeBytes(bytes, decimals = 2) {
    document.write(formatBytes(bytes, decimals));
}

function file_submitted(free_memory) {

    input = document.getElementById('image');
    file_size = document.getElementById('current_size');
    enough_space = document.getElementById('got_space');
    submit_button = document.getElementById('submit');

    if (!window.FileReader) {
        console.log("The file API isn't supported on this browser yet.");
        return;
    }
    if (!input.files) {
        console.log("File API not supported.");
        return;
    }

    file = input.files[0];
    file_size.textContent = formatBytes(file.size);

    // 1.5 times more as a precaution, along with a strict inequality
    if(file.size * 1.5 < free_memory)
    {
        enough_space.textContent = "Да";
        enough_space.style.color = 'green';
        submit_button.disabled = false;
    }
    else
    {
        enough_space.textContent = "Нет";
        enough_space.style.color = 'red';
        submit_button.disabled = true;
    }
}