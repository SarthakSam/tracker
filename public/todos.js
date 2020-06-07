function submitForm(){
    let form = document.getElementById('todosForm')
    console.log(form);
    form.submit()
}

function todoClicked(event){
    const lis = $(".todos");
    // console.log(lis);
    for(let i = 0; i < lis.length;i++){
        if(lis[i].classList.contains("active"))
            lis[i].classList.remove("active");
    }
    if(event.target.tagName == "LI")
        event.target.classList.add("active");
    else if(event.target.parentNode.tagName == "LI")
        event.target.parentNode.classList.add("active");
}