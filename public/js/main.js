$(document).ready(()=> {
  $('.delete-article').on('click',  (e)=> {
    $target = $(e.target)
    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/articles/'+id,
      success: (response)=>{
        alert('Usuwanie Artykułu')
        window.location.href = '/'
      },
      error: (err)=> {
        console.log(err);
      }
    })
  })

})
