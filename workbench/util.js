
function open_blob(text, type) {
    
    let tempLink = document.createElement("a");

    // {type: 'text/plain'}
    let blob = new Blob([text], {type: type});

    tempLink.setAttribute('href', URL.createObjectURL(blob));
    tempLink.setAttribute('target', '_blank');
  
    // tempLink.setAttribute('download', `${name.toLowerCase()}.txt`);
    // tempLink.setAttribute('download', file);
  
    tempLink.click();
  
}

function open_link(href) {

    let tempLink = document.createElement("a");
    tempLink.setAttribute('href', href);
    tempLink.setAttribute('target', '_blank');
    tempLink.click();
}