const $doneButton = document.getElementById('done-button')
const $task = document.getElementById('task')

$doneButton.addEventListener('click', ()=>{
    $task.style.textDecoration ='line-through'
})